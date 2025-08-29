/**
 * 🌐 EventBus - Sistema de Eventos Unificado do Microbioma Digital
 * 
 * Event-driven architecture centralizada para alta performance e baixo acoplamento
 * 
 * @author Microbioma Digital Team
 * @version 0.2.0
 */

import { EventEmitter } from 'node:events';
import { LoggerStatic as Logger } from '../utils/Logger.js';

class EventBus extends EventEmitter {
    constructor(config = {}) {
        super({
            captureRejections: true,
            maxListeners: 100
        });
        
        this.config = {
            enableMetrics: config.enableMetrics !== false,
            enableDebug: config.enableDebug || false,
            maxRetries: config.maxRetries || 3,
            retryDelay: config.retryDelay || 1000,
            ...config
        };
        
        // Métricas de performance
        this.metrics = {
            eventsEmitted: 0,
            eventsProcessed: 0,
            eventsFailed: 0,
            avgProcessingTime: 0,
            subscribers: new Map()
        };
        
        // Pool de listeners para reuso
        this.listenerPool = new Map();
        
        // Buffer de eventos para high-throughput
        this.eventBuffer = [];
        this.bufferSize = 100;
        this.flushInterval = 50; // 50ms
        
        this.startBufferFlush();
        this.setupErrorHandling();
        
        Logger.info('🌐 EventBus inicializado com arquitetura event-driven');
    }

    /**
     * Emite evento com buffer otimizado
     */
    emitBuffered(event, data, options = {}) {
        const eventData = {
            event,
            data,
            timestamp: Date.now(),
            id: this.generateEventId(),
            priority: options.priority || 'normal',
            retryCount: 0,
            ...options
        };

        // Adicionar ao buffer
        this.eventBuffer.push(eventData);
        
        // Flush imediato para eventos críticos
        if (options.priority === 'critical' || this.eventBuffer.length >= this.bufferSize) {
            this.flushBuffer();
        }

        if (this.config.enableMetrics) {
            this.metrics.eventsEmitted++;
        }

        return eventData.id;
    }

    /**
     * Flush buffer de eventos
     */
    flushBuffer() {
        if (this.eventBuffer.length === 0) return;

        const events = this.eventBuffer.splice(0, this.bufferSize);
        
        // Processar eventos por prioridade
        const sortedEvents = events.sort((a, b) => {
            const priorities = { critical: 3, high: 2, normal: 1, low: 0 };
            return (priorities[b.priority] || 1) - (priorities[a.priority] || 1);
        });

        for (const eventData of sortedEvents) {
            this.processEvent(eventData);
        }
    }

    /**
     * Processa evento individual
     */
    async processEvent(eventData) {
        const startTime = Date.now();

        try {
            await this.emitWithRetry(eventData.event, eventData.data, eventData);
            
            if (this.config.enableMetrics) {
                this.metrics.eventsProcessed++;
                this.updateProcessingTime(Date.now() - startTime);
            }

        } catch (error) {
            Logger.error(`❌ Erro ao processar evento ${eventData.event}:`, error);
            
            if (this.config.enableMetrics) {
                this.metrics.eventsFailed++;
            }
        }
    }

    /**
     * Emit com retry automático
     */
    async emitWithRetry(event, data, eventData) {
        let lastError;

        for (let retry = 0; retry <= this.config.maxRetries; retry++) {
            try {
                this.emit(event, data, eventData);
                return;
            } catch (error) {
                lastError = error;
                eventData.retryCount = retry + 1;

                if (retry < this.config.maxRetries) {
                    await this.delay(this.config.retryDelay * Math.pow(2, retry));
                }
            }
        }

        throw lastError;
    }

    /**
     * Subscrição otimizada com pooling
     */
    subscribe(event, handler, options = {}) {
        const wrappedHandler = this.wrapHandler(handler, options);
        
        this.on(event, wrappedHandler);
        
        // Tracking de subscribers
        if (this.config.enableMetrics) {
            if (!this.metrics.subscribers.has(event)) {
                this.metrics.subscribers.set(event, 0);
            }
            this.metrics.subscribers.set(event, this.metrics.subscribers.get(event) + 1);
        }

        return () => this.unsubscribe(event, wrappedHandler);
    }

    /**
     * Wrapper para handlers com error handling
     */
    wrapHandler(handler, options = {}) {
        return async (data, eventData) => {
            try {
                await handler(data, eventData);
            } catch (error) {
                Logger.error(`❌ Erro no handler do evento:`, error);
                
                if (options.onError) {
                    options.onError(error, data, eventData);
                }
            }
        };
    }

    /**
     * Remove subscrição
     */
    unsubscribe(event, handler) {
        this.removeListener(event, handler);
        
        if (this.config.enableMetrics) {
            const count = this.metrics.subscribers.get(event) || 0;
            if (count > 0) {
                this.metrics.subscribers.set(event, count - 1);
            }
        }
    }

    /**
     * Configurar flush automático do buffer
     */
    startBufferFlush() {
        this.flushTimer = setInterval(() => {
            this.flushBuffer();
        }, this.flushInterval);
    }

    /**
     * Setup de error handling
     */
    setupErrorHandling() {
        this.on('error', (error) => {
            Logger.error('❌ Erro no EventBus:', error);
        });

        // Capturar rejections
        this.on('uncaughtException', (error) => {
            Logger.error('❌ Exception não capturada no EventBus:', error);
        });
    }

    /**
     * Utilitários
     */
    generateEventId() {
        return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    updateProcessingTime(time) {
        const count = this.metrics.eventsProcessed;
        this.metrics.avgProcessingTime = ((this.metrics.avgProcessingTime * (count - 1)) + time) / count;
    }

    /**
     * Métricas e estatísticas
     */
    getMetrics() {
        return {
            ...this.metrics,
            bufferSize: this.eventBuffer.length,
            listenerCount: this.listenerCount(),
            subscribers: Object.fromEntries(this.metrics.subscribers)
        };
    }

    /**
     * Health check
     */
    getHealth() {
        const metrics = this.getMetrics();
        const errorRate = metrics.eventsEmitted > 0 ? metrics.eventsFailed / metrics.eventsEmitted : 0;
        
        return {
            status: errorRate < 0.1 ? 'healthy' : 'degraded',
            errorRate: (errorRate * 100).toFixed(2) + '%',
            avgProcessingTime: `${metrics.avgProcessingTime.toFixed(2)}ms`,
            bufferUtilization: `${((metrics.bufferSize / this.bufferSize) * 100).toFixed(1)}%`,
            subscribersCount: metrics.subscribers.size
        };
    }

    /**
     * Limpar recursos
     */
    async destroy() {
        // Flush final do buffer
        this.flushBuffer();
        
        // Parar timers
        if (this.flushTimer) {
            clearInterval(this.flushTimer);
        }
        
        // Remover todos os listeners
        this.removeAllListeners();
        
        Logger.info('🌐 EventBus destruído');
    }
}

// Singleton instance
let eventBusInstance = null;

export const EventBusStatic = {
    getInstance(config) {
        if (!eventBusInstance) {
            eventBusInstance = new EventBus(config);
        }
        return eventBusInstance;
    },

    // Métodos de conveniência
    emit(event, data, options) {
        return this.getInstance().emitBuffered(event, data, options);
    },

    subscribe(event, handler, options) {
        return this.getInstance().subscribe(event, handler, options);
    },

    getMetrics() {
        return this.getInstance().getMetrics();
    },

    getHealth() {
        return this.getInstance().getHealth();
    }
};

export default EventBus;