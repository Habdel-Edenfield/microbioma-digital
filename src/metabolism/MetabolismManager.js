/**
 * 🧬 MetabolismManager - Coordenador do Metabolismo Informacional
 * 
 * Sistema central que coordena análise, detecção de padrões e geração de insights
 * 
 * @author Microbioma Digital Team
 * @version 0.1.0
 */
import { LoggerStatic as Logger } from '../utils/Logger.js';
import ConversationAnalyzer from './ConversationAnalyzer.js';
import PatternDetector from './PatternDetector.js';

class MetabolismManager {
    constructor(config = {}) {
        this.config = {
            autoAnalysis: config.autoAnalysis !== false,
            analysisInterval: config.analysisInterval || 30000, // 30 segundos
            batchSize: config.batchSize || 10,
            enableRealTime: config.enableRealTime !== false,
            ...config
        };
        
        this.analyzer = null;
        this.patternDetector = null;
        this.isRunning = false;
        this.analysisQueue = [];
        this.processingQueue = false;
        this.analysisTimer = null;
        
        Logger.info('🧬 MetabolismManager inicializado');
    }

    /**
     * Inicializa o sistema de metabolismo
     */
    async initialize() {
        try {
            Logger.info('🧬 Inicializando sistema de metabolismo...');
            
                                    // Inicializar ConversationAnalyzer
                        this.analyzer = new ConversationAnalyzer(this.config);
                        
                        // Inicializar PatternDetector
                        this.patternDetector = new PatternDetector(this.config);
            
            // Iniciar processamento automático se habilitado
            if (this.config.autoAnalysis) {
                await this.startAutoAnalysis();
            }
            
            Logger.info('✅ Sistema de metabolismo inicializado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao inicializar metabolismo:', error);
            throw error;
        }
    }

    /**
     * Inicia análise automática
     */
    async startAutoAnalysis() {
        if (this.isRunning) {
            Logger.warn('⚠️ Análise automática já está rodando');
            return;
        }
        
        this.isRunning = true;
        this.analysisTimer = setInterval(async () => {
            await this.processAnalysisQueue();
        }, this.config.analysisInterval);
        
        Logger.info('🔄 Análise automática iniciada');
    }

    /**
     * Para análise automática
     */
    async stopAutoAnalysis() {
        if (this.analysisTimer) {
            clearInterval(this.analysisTimer);
            this.analysisTimer = null;
        }
        
        this.isRunning = false;
        Logger.info('⏹️ Análise automática parada');
    }

    /**
     * Adiciona conversa para análise
     */
    async addConversationForAnalysis(conversation) {
        try {
            if (!conversation || !conversation.id) {
                Logger.warn('⚠️ Conversa inválida para análise');
                return false;
            }
            
            // Verificar se já foi analisada
            if (this.analyzer.getCachedAnalysis(conversation.id)) {
                Logger.info(`ℹ️ Conversa ${conversation.id} já foi analisada`);
                return true;
            }
            
            // Adicionar à fila de análise
            this.analysisQueue.push({
                conversation,
                timestamp: new Date().toISOString(),
                priority: this.calculatePriority(conversation)
            });
            
            // Ordenar fila por prioridade
            this.sortQueueByPriority();
            
            Logger.info(`📥 Conversa ${conversation.id} adicionada à fila de análise`);
            
            // Processar imediatamente se habilitado
            if (this.config.enableRealTime && !this.processingQueue) {
                await this.processAnalysisQueue();
            }
            
            return true;
            
        } catch (error) {
            Logger.error('❌ Erro ao adicionar conversa para análise:', error);
            return false;
        }
    }

    /**
     * Processa fila de análise
     */
    async processAnalysisQueue() {
        if (this.processingQueue || this.analysisQueue.length === 0) {
            return;
        }
        
        this.processingQueue = true;
        
        try {
            Logger.info(`🔄 Processando ${this.analysisQueue.length} conversas na fila de análise`);
            
            const batch = this.analysisQueue.splice(0, this.config.batchSize);
            
            for (const item of batch) {
                try {
                    await this.analyzeConversation(item.conversation);
                    Logger.info(`✅ Conversa ${item.conversation.id} analisada com sucesso`);
                } catch (error) {
                    Logger.error(`❌ Erro ao analisar conversa ${item.conversation.id}:`, error);
                    // Recolocar na fila com prioridade reduzida
                    item.priority = Math.max(0, item.priority - 1);
                    this.analysisQueue.push(item);
                }
            }
            
            // Reordenar fila após processamento
            this.sortQueueByPriority();
            
            Logger.info(`✅ Lote de análise processado: ${batch.length} conversas`);
            
        } catch (error) {
            Logger.error('❌ Erro ao processar fila de análise:', error);
        } finally {
            this.processingQueue = false;
        }
    }

    /**
     * Analisa conversa diretamente
     */
    async analyzeConversation(conversation) {
        try {
            if (!this.analyzer) {
                throw new Error('ConversationAnalyzer não inicializado');
            }
            
            if (!this.patternDetector) {
                throw new Error('PatternDetector não inicializado');
            }
            
            Logger.info(`🧬 Analisando conversa: ${conversation.id}`);
            
            // Análise básica com ConversationAnalyzer
            const basicAnalysis = await this.analyzer.analyzeConversation(conversation);
            
            // Detecção de padrões avançados com PatternDetector
            const advancedPatterns = await this.patternDetector.detectAdvancedPatterns(conversation, basicAnalysis);
            
            // Consolidação dos resultados
            const consolidatedAnalysis = {
                conversationId: conversation.id,
                timestamp: new Date().toISOString(),
                basicAnalysis,
                advancedPatterns,
                metabolismVersion: '0.2.0'
            };
            
            Logger.info(`✅ Análise completa concluída para conversa: ${conversation.id}`);
            return consolidatedAnalysis;
            
        } catch (error) {
            Logger.error('❌ Erro ao analisar conversa:', error);
            throw error;
        }
    }

    /**
     * Obtém análise de conversa
     */
    async getConversationAnalysis(conversationId) {
        if (!this.analyzer) {
            return null;
        }
        
        // Tentar obter do cache primeiro
        let analysis = this.analyzer.getCachedAnalysis(conversationId);
        
        if (!analysis) {
            Logger.info(`🔍 Análise não encontrada em cache para ${conversationId}, analisando...`);
            
            // Buscar conversa do banco e analisar
            // TODO: Integrar com DatabaseManager para buscar conversa
            return null;
        }
        
        return analysis;
    }

    /**
     * Calcula prioridade de análise para conversa
     */
    calculatePriority(conversation) {
        let priority = 1; // Prioridade base
        
        // Priorizar conversas mais recentes
        if (conversation.endTime) {
            const ageHours = (Date.now() - new Date(conversation.endTime).getTime()) / (1000 * 60 * 60);
            priority += Math.max(0, 10 - ageHours); // +10 para conversas muito recentes
        }
        
        // Priorizar conversas com mais mensagens
        if (conversation.messages && conversation.messages.length > 0) {
            priority += Math.min(5, conversation.messages.length / 10); // +5 para conversas longas
        }
        
        // Priorizar conversas com contexto técnico
        if (conversation.context && conversation.context.project) {
            priority += 2; // +2 para conversas com contexto de projeto
        }
        
        return Math.min(10, priority); // Máximo de 10
    }

    /**
     * Ordena fila por prioridade
     */
    sortQueueByPriority() {
        this.analysisQueue.sort((a, b) => b.priority - a.priority);
    }

    /**
     * Obtém estatísticas do metabolismo
     */
    async getMetabolismStats() {
        const analyzerStats = this.analyzer ? this.analyzer.getAnalysisStats() : {};
        const patternStats = this.patternDetector ? this.patternDetector.getPatternStats() : {};
        
        return {
            isRunning: this.isRunning,
            queueSize: this.analysisQueue.length,
            processingQueue: this.processingQueue,
            autoAnalysis: this.config.autoAnalysis,
            analysisInterval: this.config.analysisInterval,
            batchSize: this.config.batchSize,
            analyzer: analyzerStats,
            patternDetector: patternStats,
            metabolismVersion: '0.2.0'
        };
    }

    /**
     * Obtém insights consolidados
     */
    async getConsolidatedInsights(limit = 20) {
        if (!this.analyzer) {
            return [];
        }
        
        // TODO: Implementar consolidação de insights de múltiplas conversas
        // Por enquanto, retorna estatísticas básicas
        return {
            totalConversations: this.analyzer.getAnalysisStats().totalAnalyses,
            queueStatus: {
                pending: this.analysisQueue.length,
                processing: this.processingQueue
            },
            systemStatus: {
                running: this.isRunning,
                autoAnalysis: this.config.autoAnalysis
            }
        };
    }

    /**
     * Limpa cache e filas
     */
    async clearCache() {
        if (this.analyzer) {
            this.analyzer.clearCache();
        }
        
        this.analysisQueue = [];
        Logger.info('🧹 Cache e filas de metabolismo limpos');
    }

    /**
     * Para o sistema de metabolismo
     */
    async stop() {
        try {
            await this.stopAutoAnalysis();
            
            // Limpar filas
            this.analysisQueue = [];
            this.processingQueue = false;
            
            Logger.info('✅ Sistema de metabolismo parado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao parar metabolismo:', error);
            throw error;
        }
    }

    /**
     * Reinicia o sistema de metabolismo
     */
    async restart() {
        try {
            Logger.info('🔄 Reiniciando sistema de metabolismo...');
            
            await this.stop();
            await this.initialize();
            
            Logger.info('✅ Sistema de metabolismo reiniciado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao reiniciar metabolismo:', error);
            throw error;
        }
    }
}

export default MetabolismManager;
