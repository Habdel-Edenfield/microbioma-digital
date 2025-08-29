/**
 * 🎯 CaptureManager - Coordenador de Captura do Microbioma Digital
 * 
 * Sistema básico de coordenação dos capturadores com filas simples
 * 
 * @author Microbioma Digital Team
 * @version 0.1.0
 */

import { LoggerStatic as Logger } from '../utils/Logger.js';
import ConversationLogger from './ConversationLogger.js';
import DatabaseManager from '../storage/DatabaseManager.js';

/**
 * Classe principal do CaptureManager
 */
class CaptureManager {
    constructor(config) {
        this.config = config;
        this.isInitialized = false;
        this.capturers = new Map();
        this.database = null;
        this.processingQueue = [];
        this.isProcessing = false;
        this.maxQueueSize = 100;
        this.processInterval = null;
    }

    /**
     * Inicializa o sistema de captura
     */
    async initialize() {
        try {
            if (this.isInitialized) {
                Logger.warn('⚠️ CaptureManager já inicializado');
                return;
            }

            Logger.info('🎯 Inicializando sistema de captura...');

            // Inicializar banco de dados
            this.database = new DatabaseManager(this.config);
            await this.database.initialize();
            Logger.info('✅ Banco de dados inicializado');

            // Inicializar capturadores
            await this.initializeCapturers();
            Logger.info('✅ Capturadores inicializados');

            // Iniciar processamento de fila
            this.startQueueProcessing();
            Logger.info('✅ Processamento de fila iniciado');

            this.isInitialized = true;
            Logger.info('🎉 Sistema de captura inicializado com sucesso');

        } catch (error) {
            Logger.error('❌ Erro ao inicializar sistema de captura:', error);
            throw error;
        }
    }

    /**
     * Inicializa os capturadores disponíveis
     */
    async initializeCapturers() {
        try {
            // Inicializar ConversationLogger
            const conversationLogger = new ConversationLogger(this.config);
            this.capturers.set('conversations', conversationLogger);
            Logger.info('✅ ConversationLogger inicializado');

            // Aqui futuramente serão adicionados outros capturadores
            // - IDEEventMonitor
            // - BehaviorTracker
            // - MetadataExtractor

            Logger.info(`✅ ${this.capturers.size} capturadores inicializados`);

        } catch (error) {
            Logger.error('❌ Erro ao inicializar capturadores:', error);
            throw error;
        }
    }

    /**
     * Inicia uma nova conversa
     */
    async startConversation(context = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const conversationLogger = this.capturers.get('conversations');
            if (!conversationLogger) {
                throw new Error('ConversationLogger não disponível');
            }

            const conversationId = await conversationLogger.startConversation(context);
            Logger.info(`💬 Nova conversa iniciada: ${conversationId}`);
            
            return conversationId;

        } catch (error) {
            Logger.error('❌ Erro ao iniciar conversa:', error);
            throw error;
        }
    }

    /**
     * Adiciona uma mensagem à conversa atual
     */
    async addMessage(message, sender = 'user', type = 'text', metadata = {}) {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const conversationLogger = this.capturers.get('conversations');
            if (!conversationLogger) {
                throw new Error('ConversationLogger não disponível');
            }

            const messageId = await conversationLogger.addMessage(message, sender, type, metadata);
            
            // Adicionar à fila de processamento
            this.addToProcessingQueue({
                type: 'message',
                data: { messageId, conversationId: conversationLogger.currentConversation?.id },
                priority: 'medium',
                timestamp: new Date().toISOString()
            });

            Logger.debug(`💬 Mensagem adicionada: ${messageId}`);
            return messageId;

        } catch (error) {
            Logger.error('❌ Erro ao adicionar mensagem:', error);
            throw error;
        }
    }

    /**
     * Finaliza a conversa atual
     */
    async endConversation() {
        try {
            if (!this.isInitialized) {
                await this.initialize();
            }

            const conversationLogger = this.capturers.get('conversations');
            if (!conversationLogger) {
                Logger.warn('⚠️ Nenhuma conversa ativa para finalizar');
                return;
            }

            await conversationLogger.endConversation();
            
            // Adicionar à fila de processamento
            this.addToProcessingQueue({
                type: 'conversation_end',
                data: { conversationId: conversationLogger.currentConversation?.id },
                priority: 'high',
                timestamp: new Date().toISOString()
            });

            Logger.info('💬 Conversa finalizada com sucesso');

        } catch (error) {
            Logger.error('❌ Erro ao finalizar conversa:', error);
            throw error;
        }
    }

    /**
     * Adiciona item à fila de processamento
     */
    addToProcessingQueue(item) {
        try {
            // Verificar se a fila não está muito cheia
            if (this.processingQueue.length >= this.maxQueueSize) {
                Logger.warn('⚠️ Fila de processamento cheia, removendo item mais antigo');
                this.processingQueue.shift();
            }

            // Adicionar item com timestamp
            this.processingQueue.push({
                ...item,
                addedAt: new Date().toISOString()
            });

            Logger.debug(`📥 Item adicionado à fila: ${item.type}`);

        } catch (error) {
            Logger.error('❌ Erro ao adicionar item à fila:', error);
        }
    }

    /**
     * Inicia o processamento da fila
     */
    startQueueProcessing() {
        try {
            // Processar fila a cada 5 segundos
            this.processInterval = setInterval(() => {
                this.processQueue();
            }, 5000);

            Logger.info('✅ Processamento de fila iniciado');

        } catch (error) {
            Logger.error('❌ Erro ao iniciar processamento de fila:', error);
        }
    }

    /**
     * Processa a fila de itens
     */
    async processQueue() {
        try {
            if (this.isProcessing || this.processingQueue.length === 0) {
                return;
            }

            this.isProcessing = true;
            Logger.debug(`🔄 Processando ${this.processingQueue.length} itens da fila`);

            // Ordenar por prioridade
            const sortedQueue = this.sortQueueByPriority(this.processingQueue);
            
            // Processar itens
            for (const item of sortedQueue) {
                try {
                    await this.processItem(item);
                    
                    // Remover item processado
                    const index = this.processingQueue.findIndex(q => q.addedAt === item.addedAt);
                    if (index > -1) {
                        this.processingQueue.splice(index, 1);
                    }
                    
                } catch (error) {
                    Logger.error(`❌ Erro ao processar item ${item.type}:`, error);
                    
                    // Se for erro crítico, remover item da fila
                    if (error.critical) {
                        const index = this.processingQueue.findIndex(q => q.addedAt === item.addedAt);
                        if (index > -1) {
                            this.processingQueue.splice(index, 1);
                        }
                    }
                }
            }

            Logger.debug(`✅ Fila processada: ${sortedQueue.length} itens`);
            this.isProcessing = false;

        } catch (error) {
            Logger.error('❌ Erro ao processar fila:', error);
            this.isProcessing = false;
        }
    }

    /**
     * Ordena a fila por prioridade
     */
    sortQueueByPriority(queue) {
        const priorityOrder = { 'high': 3, 'medium': 2, 'low': 1 };
        
        return [...queue].sort((a, b) => {
            const priorityA = priorityOrder[a.priority] || 1;
            const priorityB = priorityOrder[b.priority] || 1;
            
            if (priorityA !== priorityB) {
                return priorityB - priorityA;
            }
            
            // Se mesma prioridade, ordenar por timestamp
            return new Date(a.addedAt) - new Date(b.addedAt);
        });
    }

    /**
     * Processa um item específico
     */
    async processItem(item) {
        try {
            switch (item.type) {
                case 'message':
                    await this.processMessage(item.data);
                    break;
                    
                case 'conversation_end':
                    await this.processConversationEnd(item.data);
                    break;
                    
                case 'ide_event':
                    await this.processIDEEvent(item.data);
                    break;
                    
                case 'behavior_pattern':
                    await this.processBehaviorPattern(item.data);
                    break;
                    
                case 'project_metadata':
                    await this.processProjectMetadata(item.data);
                    break;
                    
                default:
                    Logger.warn(`⚠️ Tipo de item desconhecido: ${item.type}`);
            }

        } catch (error) {
            Logger.error(`❌ Erro ao processar item ${item.type}:`, error);
            throw error;
        }
    }

    /**
     * Processa uma mensagem
     */
    async processMessage(data) {
        try {
            // Aqui futuramente será implementado processamento mais avançado
            // Por enquanto, apenas logar
            Logger.debug(`📝 Processando mensagem: ${data.messageId}`);
            
        } catch (error) {
            Logger.error('❌ Erro ao processar mensagem:', error);
            throw error;
        }
    }

    /**
     * Processa fim de conversa
     */
    async processConversationEnd(data) {
        try {
            Logger.debug(`🔚 Processando fim de conversa: ${data.conversationId}`);
            
            // Aqui futuramente será implementado processamento mais avançado
            // - Análise de tópicos
            // - Geração de resumos
            // - Identificação de padrões
            
        } catch (error) {
            Logger.error('❌ Erro ao processar fim de conversa:', error);
            throw error;
        }
    }

    /**
     * Processa evento da IDE
     */
    async processIDEEvent(data) {
        try {
            Logger.debug(`🖥️ Processando evento IDE: ${data.eventType}`);
            
            // Aqui futuramente será implementado processamento mais avançado
            
        } catch (error) {
            Logger.error('❌ Erro ao processar evento IDE:', error);
            throw error;
        }
    }

    /**
     * Processa padrão comportamental
     */
    async processBehaviorPattern(data) {
        try {
            Logger.debug(`🧠 Processando padrão comportamental: ${data.patternType}`);
            
            // Aqui futuramente será implementado processamento mais avançado
            
        } catch (error) {
            Logger.error('❌ Erro ao processar padrão comportamental:', error);
            throw error;
        }
    }

    /**
     * Processa metadados do projeto
     */
    async processProjectMetadata(data) {
        try {
            Logger.debug(`📊 Processando metadados do projeto: ${data.projectName}`);
            
            // Aqui futuramente será implementado processamento mais avançado
            
        } catch (error) {
            Logger.error('❌ Erro ao processar metadados do projeto:', error);
            throw error;
        }
    }

    /**
     * Obtém estatísticas do sistema de captura
     */
    async getCaptureStats() {
        try {
            const stats = {
                isInitialized: this.isInitialized,
                capturersCount: this.capturers.size,
                queueSize: this.processingQueue.length,
                isProcessing: this.isProcessing,
                databaseStats: null,
                conversationStats: null
            };

            // Estatísticas do banco
            if (this.database) {
                stats.databaseStats = await this.database.getDatabaseStats();
            }

            // Estatísticas das conversas
            const conversationLogger = this.capturers.get('conversations');
            if (conversationLogger) {
                stats.conversationStats = await conversationLogger.getConversationStats();
            }

            return stats;

        } catch (error) {
            Logger.error('❌ Erro ao obter estatísticas de captura:', error);
            return null;
        }
    }

    /**
     * Limpa dados antigos
     */
    async cleanOldData(daysToKeep = 30) {
        try {
            Logger.info('🧹 Iniciando limpeza de dados antigos...');

            let cleanedCount = 0;

            // Limpar banco de dados
            if (this.database) {
                const dbCleaned = await this.database.cleanOldData(daysToKeep);
                cleanedCount += dbCleaned;
            }

            // Limpar conversas antigas
            const conversationLogger = this.capturers.get('conversations');
            if (conversationLogger) {
                const convCleaned = await conversationLogger.cleanOldConversations(daysToKeep);
                cleanedCount += convCleaned;
            }

            Logger.info(`🧹 Limpeza concluída: ${cleanedCount} itens removidos`);
            return cleanedCount;

        } catch (error) {
            Logger.error('❌ Erro ao limpar dados antigos:', error);
            return 0;
        }
    }

    /**
     * Inicia captura automática de conversas
     */
    async startAutoCapture() {
        try {
            Logger.info('📡 Iniciando captura automática...');
            
            // Configurar captura automática baseada em eventos
            if (this.config.capture?.auto_capture !== false) {
                // Simular captura automática a cada intervalo
                this.autoCaptureInterval = setInterval(async () => {
                    try {
                        await this.performAutoCapture();
                    } catch (error) {
                        Logger.error('❌ Erro na captura automática:', error);
                    }
                }, this.config.capture?.capture_interval || 30000); // 30 segundos por padrão
                
                Logger.info('✅ Captura automática configurada');
            }
            
        } catch (error) {
            Logger.error('❌ Erro ao iniciar captura automática:', error);
            throw error;
        }
    }

    /**
     * Executa captura automática
     */
    async performAutoCapture() {
        try {
            // Aqui futuramente será implementada captura automática real
            // Por enquanto, apenas log de status
            Logger.debug('📡 Executando captura automática...');
            
            // Verificar se há novas conversas para capturar
            // (implementação futura com monitoramento de IDE)
            
        } catch (error) {
            Logger.error('❌ Erro na captura automática:', error);
        }
    }

    /**
     * Inicia processamento automático de dados capturados
     */
    async startAutoProcessing() {
        try {
            Logger.info('⚙️ Iniciando processamento automático...');
            
            if (this.config.capture?.auto_process !== false) {
                // Processar fila automaticamente a cada intervalo
                this.autoProcessInterval = setInterval(async () => {
                    try {
                        await this.processQueue();
                    } catch (error) {
                        Logger.error('❌ Erro no processamento automático:', error);
                    }
                }, this.config.capture?.process_interval || 15000); // 15 segundos por padrão
                
                Logger.info('✅ Processamento automático configurado');
            }
            
        } catch (error) {
            Logger.error('❌ Erro ao iniciar processamento automático:', error);
            throw error;
        }
    }

    /**
     * Obtém conversas pendentes de processamento
     */
    async getPendingConversations() {
        try {
            if (!this.database) {
                Logger.warn('⚠️ Banco de dados não inicializado');
                return [];
            }
            
            // Buscar conversas que não foram processadas pelo metabolismo
            const pendingConversations = await this.database.getConversationsByStatus('pending');
            
            Logger.debug(`📊 ${pendingConversations.length} conversas pendentes encontradas`);
            return pendingConversations;
            
        } catch (error) {
            Logger.error('❌ Erro ao obter conversas pendentes:', error);
            return [];
        }
    }

    /**
     * Para o sistema de captura
     */
    async shutdown() {
        try {
            Logger.info('🛑 Parando sistema de captura...');
            
            // Parar captura automática
            if (this.autoCaptureInterval) {
                clearInterval(this.autoCaptureInterval);
                this.autoCaptureInterval = null;
                Logger.info('✅ Captura automática parada');
            }
            
            // Parar processamento automático
            if (this.autoProcessInterval) {
                clearInterval(this.autoProcessInterval);
                this.autoProcessInterval = null;
                Logger.info('✅ Processamento automático parado');
            }
            
            // Parar processamento de fila
            if (this.processInterval) {
                clearInterval(this.processInterval);
                this.processInterval = null;
                Logger.info('✅ Processamento de fila parado');
            }
            
            // Salvar dados pendentes
            if (this.processingQueue.length > 0) {
                Logger.info(`💾 Salvando ${this.processingQueue.length} itens pendentes...`);
                await this.processQueue();
            }
            
            Logger.info('🎉 Sistema de captura parado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao parar sistema de captura:', error);
        }
    }
}

export default CaptureManager;
