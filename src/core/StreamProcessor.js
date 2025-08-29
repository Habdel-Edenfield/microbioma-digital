/**
 * 🌊 StreamProcessor - Processamento de Stream Otimizado
 * 
 * Sistema de streaming com backpressure e workers paralelos
 * 
 * @author Microbioma Digital Team
 * @version 0.2.0
 */

import { Worker } from 'node:worker_threads';
import { Transform, Readable, Writable } from 'node:stream';
import { pipeline } from 'node:stream/promises';
import { LoggerStatic as Logger } from '../utils/Logger.js';
import { EventBusStatic } from './EventBus.js';

class StreamProcessor {
    constructor(config = {}) {
        this.config = {
            concurrency: config.concurrency || Math.max(2, Math.floor(4 / 2)), // Fixed for ES modules
            bufferSize: config.bufferSize || 1000,
            backpressureThreshold: config.backpressureThreshold || 0.8,
            workerTimeout: config.workerTimeout || 30000,
            enableWorkers: config.enableWorkers !== false,
            ...config
        };
        
        this.workers = [];
        this.workerPool = [];
        this.activeJobs = new Map();
        this.metrics = {
            processed: 0,
            failed: 0,
            avgLatency: 0,
            throughput: 0,
            backpressureEvents: 0
        };
        
        this.isShuttingDown = false;
        
        this.initializeWorkerPool();
        
        Logger.info(`🌊 StreamProcessor inicializado com ${this.config.concurrency} workers`);
    }

    /**
     * Inicializa pool de workers
     */
    async initializeWorkerPool() {
        if (!this.config.enableWorkers) return;

        for (let i = 0; i < this.config.concurrency; i++) {
            const worker = await this.createWorker();
            this.workerPool.push(worker);
        }
    }

    /**
     * Cria worker otimizado
     */
    async createWorker() {
        const workerCode = `
            const { parentPort } = require('worker_threads');
            
            parentPort.on('message', async ({ id, type, data, config }) => {
                try {
                    let result;
                    
                    switch (type) {
                        case 'analyze_conversation':
                            result = await analyzeConversation(data, config);
                            break;
                        case 'detect_patterns':
                            result = await detectPatterns(data, config);
                            break;
                        case 'generate_insights':
                            result = await generateInsights(data, config);
                            break;
                        default:
                            throw new Error('Unknown task type: ' + type);
                    }
                    
                    parentPort.postMessage({ id, success: true, result });
                    
                } catch (error) {
                    parentPort.postMessage({ 
                        id, 
                        success: false, 
                        error: { message: error.message, stack: error.stack }
                    });
                }
            });

            // Análise básica de conversa
            async function analyzeConversation(conversation, config) {
                const analysis = {
                    id: conversation.id,
                    messageCount: conversation.messages?.length || 0,
                    participants: [],
                    topics: [],
                    sentiment: 'neutral',
                    complexity: 0,
                    timestamp: new Date().toISOString()
                };

                if (conversation.messages) {
                    // Extrair participantes únicos
                    analysis.participants = [...new Set(conversation.messages.map(m => m.sender))];
                    
                    // Detectar tópicos simples
                    const content = conversation.messages.map(m => m.content).join(' ').toLowerCase();
                    const keywords = content.match(/\\b\\w{4,}\\b/g) || [];
                    const keywordCounts = {};
                    
                    keywords.forEach(word => {
                        keywordCounts[word] = (keywordCounts[word] || 0) + 1;
                    });
                    
                    analysis.topics = Object.entries(keywordCounts)
                        .sort(([,a], [,b]) => b - a)
                        .slice(0, 5)
                        .map(([word]) => word);
                    
                    // Calcular complexidade
                    analysis.complexity = Math.min(10, 
                        Math.floor(keywords.length / 10) + analysis.participants.length
                    );
                }

                return analysis;
            }

            // Detecção de padrões
            async function detectPatterns(data, config) {
                const patterns = {
                    conversationId: data.conversationId,
                    patterns: [],
                    confidence: 0.5,
                    timestamp: new Date().toISOString()
                };

                // Simular detecção de padrões básicos
                if (data.messageCount > 5) {
                    patterns.patterns.push({
                        type: 'conversation_length',
                        description: 'Conversa extensa detectada',
                        confidence: 0.8
                    });
                }

                if (data.topics && data.topics.includes('error')) {
                    patterns.patterns.push({
                        type: 'troubleshooting',
                        description: 'Sessão de debugging detectada',
                        confidence: 0.7
                    });
                }

                patterns.confidence = patterns.patterns.length > 0 ? 
                    patterns.patterns.reduce((sum, p) => sum + p.confidence, 0) / patterns.patterns.length : 0;

                return patterns;
            }

            // Geração de insights
            async function generateInsights(data, config) {
                return {
                    conversationId: data.conversationId,
                    insights: [
                        {
                            type: 'productivity',
                            description: 'Análise de produtividade baseada na conversa',
                            score: Math.random() * 10,
                            recommendations: []
                        }
                    ],
                    timestamp: new Date().toISOString()
                };
            }
        `;

        return new Promise((resolve, reject) => {
            const worker = new Worker(workerCode, { eval: true });
            
            worker.on('error', reject);
            worker.once('online', () => {
                worker.isReady = true;
                worker.jobCount = 0;
                resolve(worker);
            });
        });
    }

    /**
     * Stream transform para processamento
     */
    createProcessingStream(processorType) {
        return new Transform({
            objectMode: true,
            highWaterMark: this.config.bufferSize,
            
            transform: async (chunk, encoding, callback) => {
                try {
                    const result = await this.processChunk(chunk, processorType);
                    callback(null, result);
                } catch (error) {
                    Logger.error('❌ Erro no stream processing:', error);
                    callback(error);
                }
            }
        });
    }

    /**
     * Processa chunk individual
     */
    async processChunk(data, processorType) {
        const startTime = Date.now();
        
        try {
            const result = await this.executeWorkerTask(processorType, data);
            
            // Métricas
            const latency = Date.now() - startTime;
            this.updateMetrics(latency, true);
            
            // Emit resultado via EventBus
            EventBusStatic.emit('stream.processed', {
                type: processorType,
                result,
                latency
            });
            
            return result;
            
        } catch (error) {
            this.updateMetrics(Date.now() - startTime, false);
            throw error;
        }
    }

    /**
     * Executa task no worker
     */
    async executeWorkerTask(type, data, timeout = this.config.workerTimeout) {
        const worker = await this.getAvailableWorker();
        const taskId = this.generateTaskId();
        
        return new Promise((resolve, reject) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`Worker task timeout: ${timeout}ms`));
            }, timeout);

            const messageHandler = (message) => {
                if (message.id === taskId) {
                    clearTimeout(timeoutId);
                    worker.removeListener('message', messageHandler);
                    this.releaseWorker(worker);

                    if (message.success) {
                        resolve(message.result);
                    } else {
                        reject(new Error(message.error.message));
                    }
                }
            };

            worker.on('message', messageHandler);
            worker.postMessage({
                id: taskId,
                type,
                data,
                config: this.config
            });

            this.activeJobs.set(taskId, { worker, startTime: Date.now() });
        });
    }

    /**
     * Obtém worker disponível com load balancing
     */
    async getAvailableWorker() {
        // Encontrar worker com menos carga
        const availableWorker = this.workerPool.reduce((min, worker) => 
            worker.jobCount < (min?.jobCount || Infinity) ? worker : min
        );

        if (availableWorker) {
            availableWorker.jobCount++;
            return availableWorker;
        }

        throw new Error('Nenhum worker disponível');
    }

    /**
     * Libera worker
     */
    releaseWorker(worker) {
        if (worker.jobCount > 0) {
            worker.jobCount--;
        }
    }

    /**
     * Pipeline de processamento completo
     */
    async createProcessingPipeline(dataStream, processors = []) {
        const transforms = processors.map(type => this.createProcessingStream(type));
        
        const outputStream = new Writable({
            objectMode: true,
            write(chunk, encoding, callback) {
                EventBusStatic.emit('pipeline.output', chunk);
                callback();
            }
        });

        try {
            await pipeline(dataStream, ...transforms, outputStream);
            Logger.info('✅ Pipeline de processamento concluído');
        } catch (error) {
            Logger.error('❌ Erro no pipeline:', error);
            throw error;
        }
    }

    /**
     * Processa conversas em batch otimizado
     */
    async processConversationsBatch(conversations) {
        const readable = Readable.from(conversations, { objectMode: true });
        
        await this.createProcessingPipeline(readable, [
            'analyze_conversation',
            'detect_patterns', 
            'generate_insights'
        ]);
    }

    /**
     * Monitoramento de backpressure
     */
    checkBackpressure() {
        const activeJobs = this.activeJobs.size;
        const maxConcurrency = this.config.concurrency;
        const utilization = activeJobs / maxConcurrency;

        if (utilization > this.config.backpressureThreshold) {
            this.metrics.backpressureEvents++;
            EventBusStatic.emit('stream.backpressure', { utilization, activeJobs });
            return true;
        }

        return false;
    }

    /**
     * Atualiza métricas
     */
    updateMetrics(latency, success) {
        if (success) {
            this.metrics.processed++;
        } else {
            this.metrics.failed++;
        }

        // Calcular latência média
        const total = this.metrics.processed + this.metrics.failed;
        this.metrics.avgLatency = ((this.metrics.avgLatency * (total - 1)) + latency) / total;
    }

    /**
     * Utilitários
     */
    generateTaskId() {
        return `task_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    getMetrics() {
        return {
            ...this.metrics,
            activeJobs: this.activeJobs.size,
            availableWorkers: this.workerPool.filter(w => w.jobCount === 0).length,
            totalWorkers: this.workerPool.length,
            backpressure: this.checkBackpressure()
        };
    }

    /**
     * Cleanup
     */
    async destroy() {
        this.isShuttingDown = true;
        
        // Aguardar jobs ativos
        const activeJobIds = Array.from(this.activeJobs.keys());
        await Promise.allSettled(activeJobIds.map(id => 
            new Promise(resolve => {
                const checkJob = () => {
                    if (!this.activeJobs.has(id)) {
                        resolve();
                    } else {
                        setTimeout(checkJob, 100);
                    }
                };
                checkJob();
            })
        ));

        // Finalizar workers
        await Promise.all(this.workerPool.map(worker => worker.terminate()));
        
        Logger.info('🌊 StreamProcessor destruído');
    }
}

export default StreamProcessor;