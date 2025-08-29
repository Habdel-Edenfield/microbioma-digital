#!/usr/bin/env node

/**
 * 🧬 Microbioma Digital - Sistema Principal
 * 
 * Ponto de entrada principal do sistema
 * 
 * @author Microbioma Digital Team
 * @version 0.2.0
 */

import { LoggerStatic as Logger } from './utils/Logger.js';
import { ConfigManagerStatic as ConfigManager } from './core/ConfigManager.js';
import SystemManager from './core/SystemManager.js';
import CaptureManager from './capture/CaptureManager.js';
import MetabolismManager from './metabolism/MetabolismManager.js';

class MicrobiomaDigital {
    constructor() {
        this.config = null;
        this.systemManager = null;
        this.captureManager = null;
        this.metabolismManager = null;
        this.isRunning = false;
    }

    /**
     * Inicializa o sistema completo
     */
    async initialize() {
        try {
            Logger.info('🧬 Iniciando Microbioma Digital...');
            
            // Carregar configurações
            this.config = await ConfigManager.load();
            Logger.info('✅ Configurações carregadas');
            
            // Inicializar sistema base
            this.systemManager = new SystemManager(this.config);
            await this.systemManager.initialize();
            Logger.info('✅ Sistema base inicializado');
            
            // Inicializar sistema de captura
            this.captureManager = new CaptureManager(this.config);
            await this.captureManager.initialize();
            Logger.info('✅ Sistema de captura inicializado');
            
            // Inicializar metabolismo informacional
            this.metabolismManager = new MetabolismManager(this.config);
            await this.metabolismManager.initialize();
            Logger.info('✅ Metabolismo informacional inicializado');
            
            // Iniciar captura automática
            await this.startAutoCapture();
            
            this.isRunning = true;
            Logger.info('🎉 Microbioma Digital inicializado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao inicializar Microbioma Digital:', error);
            throw error;
        }
    }

    /**
     * Inicia captura automática de conversas
     */
    async startAutoCapture() {
        try {
            Logger.info('📡 Iniciando captura automática...');
            
            // Configurar captura automática
            if (this.config.capture?.auto_capture !== false) {
                await this.captureManager.startAutoCapture();
                Logger.info('✅ Captura automática iniciada');
                
                // Configurar processamento automático
                if (this.config.capture?.auto_process !== false) {
                    await this.captureManager.startAutoProcessing();
                    Logger.info('✅ Processamento automático iniciado');
                }
            }
            
        } catch (error) {
            Logger.error('❌ Erro ao iniciar captura automática:', error);
        }
    }

    /**
     * Captura uma conversa manualmente
     */
    async captureConversation(conversationData) {
        try {
            if (!this.captureManager) {
                throw new Error('Sistema de captura não inicializado');
            }
            
            Logger.info(`📝 Capturando conversa: ${conversationData.id || 'sem_id'}`);
            
            // Usar startConversation para iniciar uma nova conversa
            const conversationId = await this.captureManager.startConversation({
                project: 'microbioma-digital',
                user: 'developer',
                environment: 'development'
            });
            
            // Adicionar mensagens se fornecidas
            if (conversationData.messages && conversationData.messages.length > 0) {
                for (const message of conversationData.messages) {
                    await this.captureManager.addMessage(
                        message.content,
                        message.sender || 'user',
                        message.type || 'text',
                        message.metadata || {}
                    );
                }
            }
            
            // Finalizar conversa
            await this.captureManager.endConversation();
            
            Logger.info(`✅ Conversa capturada com sucesso: ${conversationId}`);
            
            // Processar automaticamente se habilitado
            if (this.config.capture?.auto_process !== false) {
                await this.processCapturedData();
            }
            
            return { conversationId, success: true };
            
        } catch (error) {
            Logger.error('❌ Erro ao capturar conversa:', error);
            throw error;
        }
    }

    /**
     * Processa dados capturados
     */
    async processCapturedData() {
        try {
            if (!this.metabolismManager) {
                throw new Error('Metabolismo não inicializado');
            }
            
            Logger.info('🧬 Processando dados capturados...');
            
            // Obter conversas não processadas
            const pendingConversations = await this.captureManager.getPendingConversations();
            
            if (pendingConversations.length > 0) {
                Logger.info(`📊 Processando ${pendingConversations.length} conversas pendentes...`);
                
                for (const conversation of pendingConversations) {
                    try {
                        await this.metabolismManager.analyzeConversation(conversation);
                        Logger.info(`✅ Conversa processada: ${conversation.id}`);
                    } catch (error) {
                        Logger.error(`❌ Erro ao processar conversa ${conversation.id}:`, error);
                    }
                }
            }
            
        } catch (error) {
            Logger.error('❌ Erro ao processar dados capturados:', error);
        }
    }

    /**
     * Para o sistema graciosamente
     */
    async shutdown() {
        try {
            Logger.info('🛑 Parando Microbioma Digital...');
            
            if (this.captureManager) {
                await this.captureManager.shutdown();
                Logger.info('✅ Sistema de captura parado');
            }
            
            if (this.metabolismManager) {
                await this.metabolismManager.shutdown();
                Logger.info('✅ Metabolismo parado');
            }
            
            if (this.systemManager) {
                await this.systemManager.shutdown();
                Logger.info('✅ Sistema base parado');
            }
            
            this.isRunning = false;
            Logger.info('🎉 Microbioma Digital parado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao parar sistema:', error);
        }
    }

    /**
     * Obtém status do sistema
     */
    getStatus() {
        return {
            isRunning: this.isRunning,
            capture: this.captureManager ? this.captureManager.getStatus() : null,
            metabolism: this.metabolismManager ? this.metabolismManager.getMetabolismStats() : null,
            system: this.systemManager ? this.systemManager.getStatus() : null
        };
    }
}

// Instância global
const microbioma = new MicrobiomaDigital();

// Tratamento de sinais para parada graciosa
process.on('SIGINT', async () => {
    Logger.info('📡 Sinal SIGINT recebido, parando sistema...');
    await microbioma.shutdown();
    process.exit(0);
});

process.on('SIGTERM', async () => {
    Logger.info('📡 Sinal SIGTERM recebido, parando sistema...');
    await microbioma.shutdown();
    process.exit(0);
});

// Inicializar sistema
microbioma.initialize()
    .then(() => {
        Logger.info('🚀 Microbioma Digital rodando em background');
        
        // Exemplo de captura manual para teste
        setTimeout(async () => {
            try {
                const testConversation = {
                    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                    startTime: new Date().toISOString(),
                    messages: [
                        {
                            id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                            timestamp: new Date().toISOString(),
                            sender: 'user',
                            content: 'Teste de captura automática do Microbioma Digital',
                            type: 'text'
                        }
                    ]
                };
                
                await microbioma.captureConversation(testConversation);
                Logger.info('✅ Teste de captura concluído');
                
            } catch (error) {
                Logger.error('❌ Erro no teste de captura:', error);
            }
        }, 5000); // Aguardar 5 segundos para inicialização completa
        
    })
    .catch(error => {
        Logger.error('❌ Falha ao inicializar Microbioma Digital:', error);
        process.exit(1);
    });

// Exportar para uso externo
export default microbioma;
