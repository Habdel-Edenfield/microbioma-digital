/**
 * 💬 ConversationLogger - Capturador de Conversas do Microbioma Digital
 * 
 * Sistema básico de captura de conversas com estrutura simples e extensível
 * 
 * @author Microbioma Digital Team
 * @version 0.1.0
 */

import fs from 'fs-extra';
import path from 'path';
import { LoggerStatic as Logger } from '../utils/Logger.js';

/**
 * Classe principal do ConversationLogger
 */
class ConversationLogger {
    constructor(config) {
        this.config = config;
        this.conversationsDir = path.join(this.config.paths.data, 'conversations');
        this.currentConversation = null;
        this.conversationBuffer = [];
        this.maxBufferSize = 10; // Máximo de mensagens no buffer
        this.ensureConversationsDirectory();
    }

    /**
     * Garante que o diretório de conversas existe
     */
    async ensureConversationsDirectory() {
        try {
            await fs.ensureDir(this.conversationsDir);
            Logger.info('✅ Diretório de conversas verificado');
        } catch (error) {
            Logger.error('❌ Erro ao criar diretório de conversas:', error);
            throw error;
        }
    }

    /**
     * Inicia uma nova conversa
     */
    async startConversation(context = {}) {
        try {
            const conversationId = this.generateConversationId();
            const timestamp = new Date().toISOString();
            
            this.currentConversation = {
                id: conversationId,
                startTime: timestamp,
                endTime: null,
                context: {
                    project: context.project || 'unknown',
                    user: context.user || 'unknown',
                    environment: context.environment || 'development',
                    ...context
                },
                messages: [],
                metadata: {
                    totalMessages: 0,
                    participants: new Set(),
                    topics: new Set(),
                    created: timestamp,
                    updated: timestamp
                }
            };

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
            if (!this.currentConversation) {
                await this.startConversation();
            }

            const messageObj = {
                id: this.generateMessageId(),
                timestamp: new Date().toISOString(),
                sender: sender,
                type: type,
                content: message,
                metadata: {
                    length: message.length,
                    hasCode: this.detectCode(message),
                    hasLinks: this.detectLinks(message),
                    ...metadata
                }
            };

            // Adicionar à conversa atual
            this.currentConversation.messages.push(messageObj);
            this.currentConversation.metadata.totalMessages++;
            this.currentConversation.metadata.updated = messageObj.timestamp;
            this.currentConversation.metadata.participants.add(sender);

            // Detectar tópicos automaticamente
            this.detectTopics(message);

            // Adicionar ao buffer
            this.conversationBuffer.push(messageObj);

            // Processar buffer se necessário
            if (this.conversationBuffer.length >= this.maxBufferSize) {
                await this.processBuffer();
            }

            Logger.debug(`💬 Mensagem adicionada: ${messageObj.id}`);
            return messageObj.id;
            
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
            if (!this.currentConversation) {
                Logger.warn('⚠️ Nenhuma conversa ativa para finalizar');
                return;
            }

            this.currentConversation.endTime = new Date().toISOString();
            
            // Processar buffer final
            if (this.conversationBuffer.length > 0) {
                await this.processBuffer();
            }

            // Salvar conversa completa
            await this.saveConversation(this.currentConversation);
            
            Logger.info(`💬 Conversa finalizada: ${this.currentConversation.id}`);
            
            // Limpar conversa atual
            this.currentConversation = null;
            this.conversationBuffer = [];
            
        } catch (error) {
            Logger.error('❌ Erro ao finalizar conversa:', error);
            throw error;
        }
    }

    /**
     * Processa o buffer de mensagens
     */
    async processBuffer() {
        try {
            if (this.conversationBuffer.length === 0) return;

            // Salvar mensagens do buffer
            const bufferPath = path.join(
                this.conversationsDir, 
                `${this.currentConversation.id}_buffer.json`
            );

            await fs.writeJson(bufferPath, this.conversationBuffer, { spaces: 2 });
            
            Logger.debug(`💾 Buffer processado: ${this.conversationBuffer.length} mensagens`);
            
            // Limpar buffer
            this.conversationBuffer = [];
            
        } catch (error) {
            Logger.error('❌ Erro ao processar buffer:', error);
        }
    }

    /**
     * Salva a conversa completa
     */
    async saveConversation(conversation) {
        try {
            const conversationPath = path.join(
                this.conversationsDir, 
                `${conversation.id}.json`
            );

            // Preparar conversa para salvamento
            const conversationToSave = {
                ...conversation,
                metadata: {
                    ...conversation.metadata,
                    participants: Array.from(conversation.metadata.participants),
                    topics: Array.from(conversation.metadata.topics)
                }
            };

            await fs.writeJson(conversationPath, conversationToSave, { spaces: 2 });
            
            Logger.info(`💾 Conversa salva: ${conversation.id}`);
            
        } catch (error) {
            Logger.error('❌ Erro ao salvar conversa:', error);
            throw error;
        }
    }

    /**
     * Carrega uma conversa específica
     */
    async loadConversation(conversationId) {
        try {
            const conversationPath = path.join(
                this.conversationsDir, 
                `${conversationId}.json`
            );

            if (!await fs.pathExists(conversationPath)) {
                throw new Error(`Conversa não encontrada: ${conversationId}`);
            }

            const conversation = await fs.readJson(conversationPath);
            Logger.debug(`📖 Conversa carregada: ${conversationId}`);
            
            return conversation;
            
        } catch (error) {
            Logger.error('❌ Erro ao carregar conversa:', error);
            throw error;
        }
    }

    /**
     * Lista todas as conversas
     */
    async listConversations(limit = 50, offset = 0) {
        try {
            const files = await fs.readdir(this.conversationsDir);
            const conversationFiles = files.filter(file => file.endsWith('.json') && !file.includes('_buffer'));
            
            const conversations = [];
            
            for (let i = offset; i < Math.min(offset + limit, conversationFiles.length); i++) {
                const file = conversationFiles[i];
                const conversationPath = path.join(this.conversationsDir, file);
                const conversation = await fs.readJson(conversationPath);
                
                conversations.push({
                    id: conversation.id,
                    startTime: conversation.startTime,
                    endTime: conversation.endTime,
                    totalMessages: conversation.metadata.totalMessages,
                    participants: conversation.metadata.participants,
                    topics: conversation.metadata.topics
                });
            }
            
            Logger.debug(`📋 ${conversations.length} conversas listadas`);
            return conversations;
            
        } catch (error) {
            Logger.error('❌ Erro ao listar conversas:', error);
            throw error;
        }
    }

    /**
     * Gera ID único para conversa
     */
    generateConversationId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `conv_${timestamp}_${random}`;
    }

    /**
     * Gera ID único para mensagem
     */
    generateMessageId() {
        const timestamp = Date.now();
        const random = Math.random().toString(36).substr(2, 9);
        return `msg_${timestamp}_${random}`;
    }

    /**
     * Detecta se a mensagem contém código
     */
    detectCode(message) {
        const codePatterns = [
            /```[\s\S]*?```/, // Blocos de código
            /`[^`]+`/, // Código inline
            /[{}();=<>+\-*/]/, // Símbolos de código
            /\b(function|class|const|let|var|if|for|while)\b/ // Palavras-chave
        ];
        
        return codePatterns.some(pattern => pattern.test(message));
    }

    /**
     * Detecta se a mensagem contém links
     */
    detectLinks(message) {
        const linkPatterns = [
            /https?:\/\/[^\s]+/, // URLs
            /www\.[^\s]+/, // URLs sem protocolo
            /[^\s]+\.(com|org|net|io|dev)/ // Domínios
        ];
        
        return linkPatterns.some(pattern => pattern.test(message));
    }

    /**
     * Detecta tópicos na mensagem
     */
    detectTopics(message) {
        if (!this.currentConversation) return;

        const topicKeywords = {
            'desenvolvimento': ['código', 'programação', 'desenvolvimento', 'app', 'software'],
            'arquitetura': ['arquitetura', 'design', 'padrão', 'estrutura', 'sistema'],
            'debugging': ['erro', 'bug', 'problema', 'debug', 'teste'],
            'tecnologia': ['tecnologia', 'framework', 'biblioteca', 'ferramenta', 'api'],
            'organização': ['organizar', 'estruturar', 'planejar', 'gerenciar', 'coordenar']
        };

        const messageLower = message.toLowerCase();
        
        for (const [topic, keywords] of Object.entries(topicKeywords)) {
            if (keywords.some(keyword => messageLower.includes(keyword))) {
                this.currentConversation.metadata.topics.add(topic);
            }
        }
    }

    /**
     * Obtém estatísticas das conversas
     */
    async getConversationStats() {
        try {
            const files = await fs.readdir(this.conversationsDir);
            const conversationFiles = files.filter(file => file.endsWith('.json') && !file.includes('_buffer'));
            
            const stats = {
                totalConversations: conversationFiles.length,
                totalSize: 0,
                averageMessages: 0,
                totalMessages: 0,
                topics: new Set(),
                participants: new Set()
            };

            for (const file of conversationFiles) {
                const conversationPath = path.join(this.conversationsDir, file);
                const conversation = await fs.readJson(conversationPath);
                const fileStats = await fs.stat(conversationPath);
                
                stats.totalSize += fileStats.size;
                stats.totalMessages += conversation.metadata.totalMessages;
                
                conversation.metadata.topics.forEach(topic => stats.topics.add(topic));
                conversation.metadata.participants.forEach(participant => stats.participants.add(participant));
            }

            stats.averageMessages = stats.totalConversations > 0 ? 
                Math.round(stats.totalMessages / stats.totalConversations) : 0;
            stats.topics = Array.from(stats.topics);
            stats.participants = Array.from(stats.participants);

            return stats;
            
        } catch (error) {
            Logger.error('❌ Erro ao obter estatísticas:', error);
            return null;
        }
    }

    /**
     * Limpa conversas antigas
     */
    async cleanOldConversations(daysToKeep = 30) {
        try {
            const files = await fs.readdir(this.conversationsDir);
            const conversationFiles = files.filter(file => file.endsWith('.json') && !file.includes('_buffer'));
            
            const cutoffDate = new Date();
            cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);
            
            let cleanedCount = 0;

            for (const file of conversationFiles) {
                const conversationPath = path.join(this.conversationsDir, file);
                const conversation = await fs.readJson(conversationPath);
                
                if (new Date(conversation.startTime) < cutoffDate) {
                    await fs.remove(conversationPath);
                    cleanedCount++;
                }
            }

            Logger.info(`🧹 Limpeza concluída: ${cleanedCount} conversas removidas`);
            return cleanedCount;
            
        } catch (error) {
            Logger.error('❌ Erro ao limpar conversas antigas:', error);
            return 0;
        }
    }
}

export default ConversationLogger;
