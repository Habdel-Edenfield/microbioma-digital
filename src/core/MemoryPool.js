/**
 * 🧠 MemoryPool - Sistema de Pool de Memória Otimizado
 * 
 * Gerenciamento eficiente de objetos reutilizáveis para alta performance
 * 
 * @author Microbioma Digital Team
 * @version 0.2.0
 */

import { LoggerStatic as Logger } from '../utils/Logger.js';

class MemoryPool {
    constructor(config = {}) {
        this.config = {
            maxSize: config.maxSize || 1000,
            cleanupInterval: config.cleanupInterval || 60000, // 1 minuto
            maxAge: config.maxAge || 300000, // 5 minutos
            enableMetrics: config.enableMetrics !== false,
            ...config
        };
        
        // Pools separados por tipo
        this.pools = new Map();
        
        // Métricas
        this.metrics = {
            hits: 0,
            misses: 0,
            creates: 0,
            reuses: 0,
            cleanups: 0,
            totalObjects: 0
        };
        
        this.startCleanupTimer();
        
        Logger.info('🧠 MemoryPool inicializado');
    }

    /**
     * Obtém objeto do pool ou cria novo
     */
    get(type, factory) {
        const pool = this.getPool(type);
        
        if (pool.available.length > 0) {
            const obj = pool.available.pop();
            obj.lastUsed = Date.now();
            pool.active.add(obj);
            
            this.metrics.hits++;
            this.metrics.reuses++;
            
            return obj.data;
        }
        
        // Criar novo objeto
        const obj = {
            id: this.generateId(),
            type,
            data: factory(),
            created: Date.now(),
            lastUsed: Date.now()
        };
        
        pool.active.add(obj);
        this.metrics.misses++;
        this.metrics.creates++;
        this.metrics.totalObjects++;
        
        return obj.data;
    }

    /**
     * Retorna objeto para o pool
     */
    release(type, data, resetFn) {
        const pool = this.getPool(type);
        
        // Encontrar objeto ativo
        let objToRelease = null;
        for (const obj of pool.active) {
            if (obj.data === data) {
                objToRelease = obj;
                break;
            }
        }
        
        if (!objToRelease) return false;
        
        // Remover de ativos
        pool.active.delete(objToRelease);
        
        // Reset personalizado se fornecido
        if (resetFn && typeof resetFn === 'function') {
            resetFn(objToRelease.data);
        } else {
            this.defaultReset(objToRelease.data);
        }
        
        // Adicionar aos disponíveis se pool não estiver cheio
        if (pool.available.length < this.config.maxSize) {
            objToRelease.lastUsed = Date.now();
            pool.available.push(objToRelease);
        } else {
            this.metrics.totalObjects--;
        }
        
        return true;
    }

    /**
     * Obtém ou cria pool para tipo específico
     */
    getPool(type) {
        if (!this.pools.has(type)) {
            this.pools.set(type, {
                type,
                available: [],
                active: new Set(),
                created: Date.now()
            });
        }
        
        return this.pools.get(type);
    }

    /**
     * Reset padrão para objetos
     */
    defaultReset(obj) {
        if (Array.isArray(obj)) {
            obj.length = 0;
        } else if (obj && typeof obj === 'object') {
            // Limpar propriedades mantendo referência
            for (const key in obj) {
                if (obj.hasOwnProperty(key)) {
                    delete obj[key];
                }
            }
        }
    }

    /**
     * Factories predefinidas para objetos comuns
     */
    static factories = {
        conversation: () => ({
            id: null,
            messages: [],
            metadata: {},
            startTime: null,
            endTime: null,
            context: {}
        }),
        
        message: () => ({
            id: null,
            timestamp: null,
            sender: null,
            content: null,
            type: 'text',
            metadata: {}
        }),
        
        analysis: () => ({
            conversationId: null,
            timestamp: null,
            insights: [],
            patterns: [],
            summary: {},
            metadata: {}
        }),
        
        buffer: () => [],
        
        map: () => new Map(),
        
        set: () => new Set()
    };

    /**
     * Métodos de conveniência para objetos comuns
     */
    getConversation() {
        return this.get('conversation', MemoryPool.factories.conversation);
    }

    releaseConversation(conversation) {
        return this.release('conversation', conversation, (obj) => {
            obj.id = null;
            obj.messages.length = 0;
            obj.metadata = {};
            obj.startTime = null;
            obj.endTime = null;
            obj.context = {};
        });
    }

    getMessage() {
        return this.get('message', MemoryPool.factories.message);
    }

    releaseMessage(message) {
        return this.release('message', message, (obj) => {
            obj.id = null;
            obj.timestamp = null;
            obj.sender = null;
            obj.content = null;
            obj.type = 'text';
            obj.metadata = {};
        });
    }

    getAnalysis() {
        return this.get('analysis', MemoryPool.factories.analysis);
    }

    releaseAnalysis(analysis) {
        return this.release('analysis', analysis, (obj) => {
            obj.conversationId = null;
            obj.timestamp = null;
            obj.insights.length = 0;
            obj.patterns.length = 0;
            obj.summary = {};
            obj.metadata = {};
        });
    }

    getBuffer() {
        return this.get('buffer', MemoryPool.factories.buffer);
    }

    releaseBuffer(buffer) {
        return this.release('buffer', buffer, (arr) => {
            arr.length = 0;
        });
    }

    /**
     * Limpeza automática de objetos antigos
     */
    cleanup() {
        const now = Date.now();
        let cleanedCount = 0;

        for (const [type, pool] of this.pools) {
            // Limpar disponíveis antigos
            pool.available = pool.available.filter(obj => {
                const age = now - obj.lastUsed;
                if (age > this.config.maxAge) {
                    cleanedCount++;
                    this.metrics.totalObjects--;
                    return false;
                }
                return true;
            });

            // Remover pools vazios
            if (pool.available.length === 0 && pool.active.size === 0) {
                this.pools.delete(type);
            }
        }

        this.metrics.cleanups++;
        
        if (cleanedCount > 0) {
            Logger.debug(`🧹 MemoryPool: ${cleanedCount} objetos limpos`);
        }

        return cleanedCount;
    }

    /**
     * Iniciar timer de limpeza
     */
    startCleanupTimer() {
        this.cleanupTimer = setInterval(() => {
            this.cleanup();
        }, this.config.cleanupInterval);
    }

    /**
     * Utilitários
     */
    generateId() {
        return `pool_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Estatísticas do pool
     */
    getStats() {
        const poolStats = {};
        let totalAvailable = 0;
        let totalActive = 0;

        for (const [type, pool] of this.pools) {
            poolStats[type] = {
                available: pool.available.length,
                active: pool.active.size,
                total: pool.available.length + pool.active.size
            };
            totalAvailable += pool.available.length;
            totalActive += pool.active.size;
        }

        const hitRate = this.metrics.hits + this.metrics.misses > 0 
            ? (this.metrics.hits / (this.metrics.hits + this.metrics.misses)) * 100 
            : 0;

        return {
            pools: poolStats,
            totals: {
                available: totalAvailable,
                active: totalActive,
                objects: this.metrics.totalObjects
            },
            metrics: {
                ...this.metrics,
                hitRate: `${hitRate.toFixed(2)}%`
            },
            poolTypes: this.pools.size
        };
    }

    /**
     * Health check
     */
    getHealth() {
        const stats = this.getStats();
        const memoryPressure = stats.totals.objects / this.config.maxSize;
        
        let status = 'healthy';
        if (memoryPressure > 0.8) status = 'warning';
        if (memoryPressure > 0.95) status = 'critical';

        return {
            status,
            memoryPressure: `${(memoryPressure * 100).toFixed(1)}%`,
            hitRate: stats.metrics.hitRate,
            totalObjects: stats.totals.objects,
            poolTypes: stats.poolTypes
        };
    }

    /**
     * Forçar limpeza completa
     */
    clear() {
        let clearedCount = 0;
        
        for (const [type, pool] of this.pools) {
            clearedCount += pool.available.length;
            pool.available.length = 0;
        }
        
        this.metrics.totalObjects -= clearedCount;
        Logger.info(`🧹 MemoryPool cleared: ${clearedCount} objetos removidos`);
        
        return clearedCount;
    }

    /**
     * Destruir pool
     */
    destroy() {
        if (this.cleanupTimer) {
            clearInterval(this.cleanupTimer);
        }
        
        const clearedCount = this.clear();
        this.pools.clear();
        
        Logger.info('🧠 MemoryPool destruído');
        return clearedCount;
    }
}

// Singleton instance
let memoryPoolInstance = null;

export const MemoryPoolStatic = {
    getInstance(config) {
        if (!memoryPoolInstance) {
            memoryPoolInstance = new MemoryPool(config);
        }
        return memoryPoolInstance;
    },

    get(type, factory) {
        return this.getInstance().get(type, factory);
    },

    release(type, data, resetFn) {
        return this.getInstance().release(type, data, resetFn);
    },

    getConversation() {
        return this.getInstance().getConversation();
    },

    releaseConversation(conversation) {
        return this.getInstance().releaseConversation(conversation);
    },

    getMessage() {
        return this.getInstance().getMessage();
    },

    releaseMessage(message) {
        return this.getInstance().releaseMessage(message);
    },

    getStats() {
        return this.getInstance().getStats();
    },

    getHealth() {
        return this.getInstance().getHealth();
    }
};

export default MemoryPool;