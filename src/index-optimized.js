#!/usr/bin/env node

/**
 * 🧬 Microbioma Digital Optimized - Sistema Principal Otimizado
 * 
 * Versão otimizada com Event-Driven Architecture e alta performance
 * 
 * @author Microbioma Digital Team
 * @version 0.2.0
 */

import { LoggerStatic as Logger } from './utils/Logger.js';
import { ConfigManagerStatic as ConfigManager } from './core/ConfigManager.js';
import { EventBusStatic } from './core/EventBus.js';
import { MemoryPoolStatic } from './core/MemoryPool.js';
import StreamProcessor from './core/StreamProcessor.js';
import DatabaseManagerOptimized from './storage/DatabaseManagerOptimized.js';

class MicrobiomaDigitalOptimized {
    constructor() {
        this.config = null;
        this.eventBus = null;
        this.database = null;
        this.streamProcessor = null;
        this.memoryPool = null;
        this.isRunning = false;
        this.startTime = Date.now();
        
        // Métricas de sistema
        this.systemMetrics = {
            startTime: this.startTime,
            conversationsProcessed: 0,
            messagesProcessed: 0,
            totalEvents: 0,
            errorCount: 0
        };
        
        this.setupEventHandlers();
    }

    /**
     * Configura handlers de eventos
     */
    setupEventHandlers() {
        // Tratar sinais do sistema
        process.on('SIGINT', () => this.gracefulShutdown('SIGINT'));
        process.on('SIGTERM', () => this.gracefulShutdown('SIGTERM'));
        process.on('uncaughtException', (error) => {
            Logger.error('❌ Uncaught Exception:', error);
            this.systemMetrics.errorCount++;
        });
        process.on('unhandledRejection', (reason) => {
            Logger.error('❌ Unhandled Rejection:', reason);
            this.systemMetrics.errorCount++;
        });
    }

    /**
     * Inicializa o sistema otimizado
     */
    async initialize() {
        try {
            Logger.info('🚀 Iniciando Microbioma Digital Optimized...');
            
            // 1. Carregar configurações
            this.config = await ConfigManager.load();
            Logger.info('✅ Configurações carregadas');
            
            // 2. Inicializar EventBus
            this.eventBus = EventBusStatic.getInstance(this.config);
            this.setupEventBusHandlers();
            Logger.info('✅ EventBus inicializado');
            
            // 3. Inicializar MemoryPool
            this.memoryPool = MemoryPoolStatic.getInstance(this.config);
            Logger.info('✅ MemoryPool inicializado');
            
            // 4. Inicializar Database otimizado
            this.database = new DatabaseManagerOptimized(this.config);
            await this.database.initialize();
            Logger.info('✅ Database otimizado inicializado');
            
            // 5. Inicializar StreamProcessor
            this.streamProcessor = new StreamProcessor(this.config);
            Logger.info('✅ StreamProcessor inicializado');
            
            // 6. Configurar monitoramento
            this.setupMonitoring();
            Logger.info('✅ Monitoramento configurado');
            
            // 7. Iniciar captura automática via eventos
            this.startEventDrivenCapture();
            Logger.info('✅ Captura automática iniciada');
            
            this.isRunning = true;
            
            const initTime = Date.now() - this.startTime;
            Logger.info(`🎉 Microbioma Optimized inicializado em ${initTime}ms`);
            
            // Emitir evento de inicialização
            this.eventBus.emitBuffered('system.initialized', {
                initTime,
                version: '0.2.0',
                components: ['EventBus', 'MemoryPool', 'Database', 'StreamProcessor']
            }, { priority: 'high' });
            
        } catch (error) {
            Logger.error('❌ Erro ao inicializar sistema otimizado:', error);
            throw error;
        }
    }

    /**
     * Configura handlers do EventBus
     */
    setupEventBusHandlers() {
        // Handler para conversas
        this.eventBus.subscribe('conversation.started', async (data) => {
            try {
                this.systemMetrics.conversationsProcessed++;
                await this.handleConversationStarted(data);
            } catch (error) {
                Logger.error('❌ Erro ao processar início de conversa:', error);
                this.systemMetrics.errorCount++;
            }
        });

        this.eventBus.subscribe('conversation.ended', async (data) => {
            try {
                await this.handleConversationEnded(data);
                
                // Processar via stream se habilitado
                if (this.config.processing?.realTime) {
                    await this.processConversationStream(data.conversationId);
                }
            } catch (error) {
                Logger.error('❌ Erro ao processar fim de conversa:', error);
                this.systemMetrics.errorCount++;
            }
        });

        // Handler para mensagens
        this.eventBus.subscribe('message.added', async (data) => {
            try {
                this.systemMetrics.messagesProcessed++;
                await this.handleMessageAdded(data);
            } catch (error) {
                Logger.error('❌ Erro ao processar mensagem:', error);
                this.systemMetrics.errorCount++;
            }
        });

        // Handler para stream processing
        this.eventBus.subscribe('stream.processed', (data) => {
            Logger.debug(`📊 Stream processado: ${data.type} em ${data.latency}ms`);
        });

        // Handler para backpressure
        this.eventBus.subscribe('stream.backpressure', (data) => {
            Logger.warn(`⚠️ Backpressure detectado: ${data.utilization * 100}% utilização`);
        });

        // Handler de eventos de sistema
        this.eventBus.subscribe('system.*', (data, eventData) => {
            this.systemMetrics.totalEvents++;
            Logger.debug(`🔔 Evento de sistema: ${eventData.event}`);
        });
    }

    /**
     * Configura monitoramento de sistema
     */
    setupMonitoring() {
        // Monitoramento a cada 30 segundos
        setInterval(async () => {
            try {
                const healthData = await this.getSystemHealth();
                
                this.eventBus.emitBuffered('system.health', healthData, {
                    priority: 'low'
                });
                
                // Log de métricas se enabled
                if (this.config.monitoring?.verbose) {
                    Logger.info('📊 System Health:', healthData);
                }
                
            } catch (error) {
                Logger.error('❌ Erro no monitoramento:', error);
            }
        }, 30000);
    }

    /**
     * Inicia captura event-driven
     */
    startEventDrivenCapture() {
        // Simular captura via eventos (substitui timers)
        
        // Timer apenas para demonstração - em produção viria de hooks do IDE
        setTimeout(async () => {
            await this.simulateConversation();
        }, 5000);
    }

    /**
     * Simula uma conversa para teste
     */
    async simulateConversation() {
        try {
            const conversationId = `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            // Emitir início de conversa
            this.eventBus.emitBuffered('conversation.started', {
                id: conversationId,
                startTime: new Date().toISOString(),
                context: {
                    project: 'microbioma-digital',
                    user: 'developer',
                    environment: 'development'
                }
            }, { priority: 'high' });

            // Aguardar processamento
            await new Promise(resolve => setTimeout(resolve, 100));

            // Emitir mensagem
            this.eventBus.emitBuffered('message.added', {
                id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                conversationId,
                sender: 'user',
                content: 'Teste do sistema otimizado do Microbioma Digital',
                type: 'text',
                timestamp: new Date().toISOString(),
                metadata: {
                    length: 49,
                    hasCode: false,
                    hasLinks: false
                }
            }, { priority: 'normal' });

            // Aguardar e finalizar
            await new Promise(resolve => setTimeout(resolve, 100));

            this.eventBus.emitBuffered('conversation.ended', {
                id: conversationId,
                endTime: new Date().toISOString()
            }, { priority: 'high' });

            Logger.info(`✅ Simulação de conversa concluída: ${conversationId}`);

        } catch (error) {
            Logger.error('❌ Erro na simulação:', error);
        }
    }

    /**
     * Handlers de eventos
     */
    async handleConversationStarted(data) {
        const conversation = MemoryPoolStatic.getConversation();
        
        try {
            Object.assign(conversation, {
                id: data.id,
                startTime: data.startTime,
                endTime: null,
                context: data.context || {},
                messages: [],
                metadata: {
                    status: 'active',
                    created: data.startTime,
                    updated: data.startTime
                }
            });

            // Salvar no banco
            await this.database.insertConversation(conversation);
            
            Logger.info(`💬 Conversa iniciada: ${data.id}`);

        } finally {
            MemoryPoolStatic.releaseConversation(conversation);
        }
    }

    async handleConversationEnded(data) {
        try {
            // Buscar conversa do banco
            const conversation = await this.database.findConversationById(data.id);
            
            if (conversation) {
                // Atualizar status
                conversation.metadata.status = 'completed';
                conversation.metadata.updated = data.endTime;
                
                await this.database.run(
                    'UPDATE conversations SET end_time = ?, metadata = ?, updated_at = datetime("now") WHERE id = ?',
                    [data.endTime, JSON.stringify(conversation.metadata), data.id]
                );
                
                Logger.info(`💬 Conversa finalizada: ${data.id}`);
            }

        } catch (error) {
            Logger.error('❌ Erro ao finalizar conversa:', error);
        }
    }

    async handleMessageAdded(data) {
        const message = MemoryPoolStatic.getMessage();
        
        try {
            Object.assign(message, {
                id: data.id,
                conversationId: data.conversationId,
                sender: data.sender,
                content: data.content,
                type: data.type || 'text',
                timestamp: data.timestamp,
                metadata: data.metadata || {}
            });

            // Inserir no banco
            await this.database.run(
                'INSERT INTO messages (id, conversation_id, sender, content, type, metadata, timestamp, created_at) VALUES (?, ?, ?, ?, ?, ?, ?, datetime("now"))',
                [message.id, message.conversationId, message.sender, message.content, message.type, JSON.stringify(message.metadata), message.timestamp]
            );

            Logger.debug(`💬 Mensagem adicionada: ${data.id}`);

        } finally {
            MemoryPoolStatic.releaseMessage(message);
        }
    }

    /**
     * Processa conversa via stream
     */
    async processConversationStream(conversationId) {
        try {
            // Buscar conversa e mensagens
            const conversation = await this.database.findConversationById(conversationId);
            if (!conversation) return;

            const messages = await this.database.all(
                'SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC',
                [conversationId]
            );

            conversation.messages = messages.map(msg => ({
                ...msg,
                metadata: JSON.parse(msg.metadata)
            }));

            // Processar via stream
            await this.streamProcessor.processConversationsBatch([conversation]);

        } catch (error) {
            Logger.error('❌ Erro no processamento via stream:', error);
        }
    }

    /**
     * Obtém health check completo do sistema
     */
    async getSystemHealth() {
        try {
            const uptime = Date.now() - this.startTime;
            
            const health = {
                status: 'healthy',
                uptime: `${Math.floor(uptime / 1000)}s`,
                components: {},
                metrics: this.systemMetrics,
                memory: {
                    used: process.memoryUsage(),
                    pool: MemoryPoolStatic.getStats()
                }
            };

            // EventBus health
            health.components.eventBus = this.eventBus.getHealth();
            
            // Database health
            health.components.database = await this.database.getHealth();
            
            // StreamProcessor health
            if (this.streamProcessor) {
                health.components.streamProcessor = this.streamProcessor.getMetrics();
            }

            // Determinar status geral
            const componentStatuses = Object.values(health.components)
                .map(comp => comp.status)
                .filter(status => status);

            if (componentStatuses.includes('critical')) {
                health.status = 'critical';
            } else if (componentStatuses.includes('degraded')) {
                health.status = 'degraded';
            } else if (componentStatuses.includes('warning')) {
                health.status = 'warning';
            }

            return health;

        } catch (error) {
            Logger.error('❌ Erro ao obter health:', error);
            return {
                status: 'error',
                error: error.message
            };
        }
    }

    /**
     * API para captura manual de conversa
     */
    async captureConversation(conversationData) {
        try {
            Logger.info(`📝 Capturando conversa: ${conversationData.id || 'sem_id'}`);
            
            // Emitir eventos via EventBus
            const conversationId = conversationData.id || `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            
            this.eventBus.emitBuffered('conversation.started', {
                id: conversationId,
                startTime: conversationData.startTime || new Date().toISOString(),
                context: conversationData.context || {}
            });

            // Processar mensagens
            if (conversationData.messages && conversationData.messages.length > 0) {
                for (const message of conversationData.messages) {
                    this.eventBus.emitBuffered('message.added', {
                        id: message.id || `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                        conversationId,
                        sender: message.sender || 'user',
                        content: message.content,
                        type: message.type || 'text',
                        timestamp: message.timestamp || new Date().toISOString(),
                        metadata: message.metadata || {}
                    });
                }
            }

            // Finalizar
            this.eventBus.emitBuffered('conversation.ended', {
                id: conversationId,
                endTime: conversationData.endTime || new Date().toISOString()
            });

            Logger.info(`✅ Conversa capturada: ${conversationId}`);
            return { conversationId, success: true };

        } catch (error) {
            Logger.error('❌ Erro ao capturar conversa:', error);
            throw error;
        }
    }

    /**
     * Obtém status do sistema
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            version: '0.2.0',
            uptime: Date.now() - this.startTime,
            metrics: this.systemMetrics,
            components: {
                eventBus: this.eventBus ? 'active' : 'inactive',
                database: this.database ? 'active' : 'inactive',
                streamProcessor: this.streamProcessor ? 'active' : 'inactive',
                memoryPool: this.memoryPool ? 'active' : 'inactive'
            }
        };
    }

    /**
     * Shutdown gracioso
     */
    async gracefulShutdown(signal) {
        try {
            Logger.info(`📡 Sinal ${signal} recebido, parando sistema...`);
            
            this.isRunning = false;

            // Emitir evento de shutdown
            if (this.eventBus) {
                this.eventBus.emitBuffered('system.shutdown', { signal }, { priority: 'critical' });
            }

            // Parar componentes
            if (this.streamProcessor) {
                await this.streamProcessor.destroy();
                Logger.info('✅ StreamProcessor parado');
            }

            if (this.database) {
                await this.database.close();
                Logger.info('✅ Database fechado');
            }

            if (this.memoryPool) {
                MemoryPoolStatic.getInstance().destroy();
                Logger.info('✅ MemoryPool limpo');
            }

            if (this.eventBus) {
                await this.eventBus.destroy();
                Logger.info('✅ EventBus destruído');
            }

            Logger.info('🎉 Shutdown concluído com sucesso');
            process.exit(0);

        } catch (error) {
            Logger.error('❌ Erro durante shutdown:', error);
            process.exit(1);
        }
    }
}

// Instância global
const microbioma = new MicrobiomaDigitalOptimized();

// Inicializar sistema
microbioma.initialize()
    .then(() => {
        Logger.info('🚀 Microbioma Digital Optimized rodando');
        
        // Log de status inicial
        const status = microbioma.getStatus();
        Logger.info('📊 Status inicial:', JSON.stringify(status, null, 2));
        
    })
    .catch(error => {
        Logger.error('❌ Falha crítica na inicialização:', error);
        process.exit(1);
    });

// Exportar para uso externo
export default microbioma;