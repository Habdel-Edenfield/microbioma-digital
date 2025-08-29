/**
 * 🗄️ DatabaseManagerOptimized - Versão Otimizada com Connection Pooling
 * 
 * Sistema avançado de gerenciamento SQLite com performance otimizada
 * 
 * @author Microbioma Digital Team
 * @version 0.2.0
 */

import sqlite3 from 'sqlite3';
import { LoggerStatic as Logger } from '../utils/Logger.js';
import { fsNative } from '../utils/NativeReplacements.js';
import { MemoryPoolStatic } from '../core/MemoryPool.js';
import path from 'path';

class DatabaseManagerOptimized {
    constructor(config = {}) {
        this.config = config;
        this.dbPath = path.resolve(config.storage?.database?.path || './data/microbioma.db');
        this.isInitialized = false;
        
        // Connection pool settings
        this.connectionPool = {
            maxConnections: config.storage?.database?.maxConnections || 5,
            connections: [],
            activeConnections: 0,
            waitingQueue: []
        };
        
        // Prepared statements cache
        this.preparedStatements = new Map();
        
        // Performance metrics
        this.metrics = {
            queries: 0,
            cacheHits: 0,
            connectionReuses: 0,
            avgQueryTime: 0,
            totalQueryTime: 0
        };
        
        // Optimized settings
        this.optimizations = {
            enableWAL: config.storage?.database?.enableWAL !== false,
            cacheSize: config.storage?.database?.cacheSize || 20000,
            mmapSize: config.storage?.database?.mmapSize || 268435456, // 256MB
            synchronous: config.storage?.database?.synchronous || 'NORMAL',
            tempStore: config.storage?.database?.tempStore || 'memory'
        };
        
        Logger.info('🗄️ DatabaseManagerOptimized inicializado');
    }

    /**
     * Inicializa o sistema de banco otimizado
     */
    async initialize() {
        try {
            if (this.isInitialized) {
                Logger.warn('⚠️ Banco já inicializado');
                return;
            }

            Logger.info('🗄️ Inicializando banco de dados otimizado...');
            
            // Criar diretório se necessário
            const dbDir = path.dirname(this.dbPath);
            await fsNative.ensureDir(dbDir);
            Logger.info('✅ Diretório do banco verificado');

            // Inicializar connection pool
            await this.initializeConnectionPool();
            Logger.info('✅ Connection pool inicializado');

            // Criar tabelas
            await this.createTables();
            Logger.info('✅ Tabelas criadas');

            // Criar índices
            await this.createIndexes();
            Logger.info('✅ Índices criados');
            
            // Preparar statements comuns
            await this.prepareCachedStatements();
            Logger.info('✅ Prepared statements criados');

            this.isInitialized = true;
            Logger.info('🎉 Banco otimizado inicializado com sucesso');

        } catch (error) {
            Logger.error('❌ Erro ao inicializar banco:', error);
            throw error;
        }
    }

    /**
     * Inicializa connection pool otimizado
     */
    async initializeConnectionPool() {
        const initialConnections = Math.min(2, this.connectionPool.maxConnections);
        
        for (let i = 0; i < initialConnections; i++) {
            const connection = await this.createOptimizedConnection();
            this.connectionPool.connections.push({
                id: i,
                db: connection,
                inUse: false,
                created: Date.now(),
                queries: 0,
                lastUsed: Date.now()
            });
        }
        
        Logger.info(`✅ Connection pool: ${initialConnections} conexões criadas`);
    }
    
    /**
     * Cria conexão SQLite otimizada
     */
    async createOptimizedConnection() {
        return new Promise((resolve, reject) => {
            const db = new sqlite3.Database(
                this.dbPath, 
                sqlite3.OPEN_READWRITE | sqlite3.OPEN_CREATE, 
                async (err) => {
                    if (err) {
                        Logger.error('❌ Erro ao criar conexão:', err);
                        reject(err);
                        return;
                    }

                    try {
                        // Aplicar otimizações SQLite
                        await this.applyOptimizations(db);
                        resolve(db);
                    } catch (optimizationError) {
                        reject(optimizationError);
                    }
                }
            );
        });
    }

    /**
     * Aplica otimizações SQLite
     */
    async applyOptimizations(db) {
        const optimizations = [
            // WAL mode para melhor concorrência
            this.optimizations.enableWAL ? 'PRAGMA journal_mode = WAL' : 'PRAGMA journal_mode = DELETE',
            
            // Sincronização otimizada
            `PRAGMA synchronous = ${this.optimizations.synchronous}`,
            
            // Cache size otimizado
            `PRAGMA cache_size = ${this.optimizations.cacheSize}`,
            
            // Temp storage em memória
            `PRAGMA temp_store = ${this.optimizations.tempStore}`,
            
            // Memory mapping para grandes databases
            `PRAGMA mmap_size = ${this.optimizations.mmapSize}`,
            
            // Otimizações automáticas
            'PRAGMA optimize',
            
            // Foreign keys (se necessário)
            'PRAGMA foreign_keys = ON'
        ];

        for (const pragma of optimizations) {
            await new Promise((resolve, reject) => {
                db.run(pragma, (err) => {
                    if (err) {
                        Logger.warn(`⚠️ Erro ao aplicar otimização "${pragma}":`, err);
                    }
                    resolve(); // Continuar mesmo com erro
                });
            });
        }
    }
    
    /**
     * Obtém conexão do pool
     */
    async getConnection() {
        return new Promise(async (resolve, reject) => {
            // Procurar conexão disponível
            const availableConnection = this.connectionPool.connections.find(conn => !conn.inUse);
            
            if (availableConnection) {
                availableConnection.inUse = true;
                availableConnection.queries++;
                availableConnection.lastUsed = Date.now();
                this.connectionPool.activeConnections++;
                this.metrics.connectionReuses++;
                resolve(availableConnection);
                return;
            }
            
            // Criar nova conexão se pool não está cheio
            if (this.connectionPool.connections.length < this.connectionPool.maxConnections) {
                try {
                    const db = await this.createOptimizedConnection();
                    const connection = {
                        id: this.connectionPool.connections.length,
                        db,
                        inUse: true,
                        created: Date.now(),
                        queries: 1,
                        lastUsed: Date.now()
                    };
                    
                    this.connectionPool.connections.push(connection);
                    this.connectionPool.activeConnections++;
                    resolve(connection);
                } catch (error) {
                    reject(error);
                }
                return;
            }
            
            // Aguardar conexão disponível
            this.connectionPool.waitingQueue.push(resolve);
        });
    }
    
    /**
     * Libera conexão de volta ao pool
     */
    releaseConnection(connection) {
        connection.inUse = false;
        connection.lastUsed = Date.now();
        this.connectionPool.activeConnections--;
        
        // Atender fila de espera
        if (this.connectionPool.waitingQueue.length > 0) {
            const resolve = this.connectionPool.waitingQueue.shift();
            connection.inUse = true;
            connection.queries++;
            this.connectionPool.activeConnections++;
            resolve(connection);
        }
    }

    /**
     * Executa query com pooling e métricas
     */
    async executeQuery(sql, params = [], method = 'run') {
        const startTime = Date.now();
        const connection = await this.getConnection();
        
        try {
            const result = await new Promise((resolve, reject) => {
                const callback = method === 'run' 
                    ? function(err) {
                        if (err) reject(err);
                        else resolve({ id: this.lastID, changes: this.changes });
                    }
                    : method === 'get'
                    ? (err, row) => {
                        if (err) reject(err);
                        else resolve(row);
                    }
                    : (err, rows) => {
                        if (err) reject(err);
                        else resolve(rows || []);
                    };

                connection.db[method](sql, params, callback);
            });
            
            // Atualizar métricas
            this.updateMetrics(Date.now() - startTime);
            
            return result;
            
        } finally {
            this.releaseConnection(connection);
        }
    }

    /**
     * Preparar statements comuns para cache
     */
    async prepareCachedStatements() {
        const commonStatements = {
            insertConversation: {
                sql: `INSERT INTO conversations (id, start_time, end_time, context, metadata, created_at, updated_at)
                      VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                params: ['id', 'startTime', 'endTime', 'context', 'metadata']
            },
            insertMessage: {
                sql: `INSERT INTO messages (id, conversation_id, sender, content, type, metadata, timestamp, created_at)
                      VALUES (?, ?, ?, ?, ?, ?, ?, datetime('now'))`,
                params: ['id', 'conversationId', 'sender', 'content', 'type', 'metadata', 'timestamp']
            },
            getConversation: {
                sql: `SELECT * FROM conversations WHERE id = ?`,
                params: ['id']
            },
            getMessages: {
                sql: `SELECT * FROM messages WHERE conversation_id = ? ORDER BY timestamp ASC`,
                params: ['conversationId']
            },
            updateConversationStatus: {
                sql: `UPDATE conversations SET metadata = ?, updated_at = datetime('now') WHERE id = ?`,
                params: ['metadata', 'id']
            }
        };

        const connection = await this.getConnection();
        
        try {
            for (const [name, statement] of Object.entries(commonStatements)) {
                const prepared = connection.db.prepare(statement.sql);
                this.preparedStatements.set(name, {
                    statement: prepared,
                    paramNames: statement.params
                });
            }
        } finally {
            this.releaseConnection(connection);
        }
    }

    /**
     * Executa statement preparado
     */
    async executePreparedStatement(name, params) {
        const prepared = this.preparedStatements.get(name);
        if (!prepared) {
            throw new Error(`Statement preparado não encontrado: ${name}`);
        }

        const startTime = Date.now();
        this.metrics.cacheHits++;

        return new Promise((resolve, reject) => {
            prepared.statement.run(params, function(err) {
                if (err) {
                    reject(err);
                } else {
                    resolve({ id: this.lastID, changes: this.changes });
                }
            });
        }).finally(() => {
            this.updateMetrics(Date.now() - startTime);
        });
    }

    /**
     * Métodos de conveniência otimizados
     */
    async run(sql, params = []) {
        return this.executeQuery(sql, params, 'run');
    }

    async get(sql, params = []) {
        return this.executeQuery(sql, params, 'get');
    }

    async all(sql, params = []) {
        return this.executeQuery(sql, params, 'all');
    }

    /**
     * Insere conversa usando statement preparado
     */
    async insertConversation(conversation) {
        const conversationObj = MemoryPoolStatic.getConversation();
        Object.assign(conversationObj, conversation);

        try {
            if (this.preparedStatements.has('insertConversation')) {
                const params = [
                    conversationObj.id,
                    conversationObj.startTime,
                    conversationObj.endTime,
                    JSON.stringify(conversationObj.context),
                    JSON.stringify(conversationObj.metadata || {})
                ];
                
                await this.executePreparedStatement('insertConversation', params);
            } else {
                await this.run(
                    `INSERT INTO conversations (id, start_time, end_time, context, metadata, created_at, updated_at)
                     VALUES (?, ?, ?, ?, ?, datetime('now'), datetime('now'))`,
                    [
                        conversationObj.id,
                        conversationObj.startTime,
                        conversationObj.endTime,
                        JSON.stringify(conversationObj.context),
                        JSON.stringify(conversationObj.metadata || {})
                    ]
                );
            }

            Logger.debug(`💾 Conversa inserida: ${conversationObj.id}`);

        } finally {
            MemoryPoolStatic.releaseConversation(conversationObj);
        }
    }

    /**
     * Busca conversa por ID com cache
     */
    async findConversationById(id) {
        const row = await this.get('SELECT * FROM conversations WHERE id = ?', [id]);
        
        if (row) {
            return {
                ...row,
                context: JSON.parse(row.context),
                metadata: JSON.parse(row.metadata)
            };
        }
        
        return null;
    }

    /**
     * Busca conversas pendentes otimizada
     */
    async getConversationsByStatus(status = 'pending', limit = 50) {
        try {
            const sql = `
                SELECT c.*, COUNT(m.id) as message_count
                FROM conversations c
                LEFT JOIN messages m ON c.id = m.conversation_id
                WHERE c.metadata LIKE ?
                GROUP BY c.id
                ORDER BY c.start_time DESC
                LIMIT ?
            `;
            
            const statusPattern = `%"status":"${status}"%`;
            const rows = await this.all(sql, [statusPattern, limit]);
            
            return rows.map(row => ({
                ...row,
                context: JSON.parse(row.context),
                metadata: JSON.parse(row.metadata)
            }));

        } catch (error) {
            Logger.error('❌ Erro ao buscar conversas por status:', error);
            return [];
        }
    }

    /**
     * Cria tabelas otimizadas
     */
    async createTables() {
        const tables = [
            {
                name: 'conversations',
                sql: `
                    CREATE TABLE IF NOT EXISTS conversations (
                        id TEXT PRIMARY KEY,
                        start_time TEXT NOT NULL,
                        end_time TEXT,
                        context TEXT NOT NULL,
                        metadata TEXT NOT NULL DEFAULT '{}',
                        created_at TEXT NOT NULL DEFAULT (datetime('now')),
                        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
                    ) WITHOUT ROWID
                `
            },
            {
                name: 'messages',
                sql: `
                    CREATE TABLE IF NOT EXISTS messages (
                        id TEXT PRIMARY KEY,
                        conversation_id TEXT NOT NULL,
                        sender TEXT NOT NULL,
                        content TEXT NOT NULL,
                        type TEXT NOT NULL DEFAULT 'text',
                        metadata TEXT NOT NULL DEFAULT '{}',
                        timestamp TEXT NOT NULL,
                        created_at TEXT NOT NULL DEFAULT (datetime('now')),
                        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
                    ) WITHOUT ROWID
                `
            },
            {
                name: 'analysis',
                sql: `
                    CREATE TABLE IF NOT EXISTS analysis (
                        id TEXT PRIMARY KEY,
                        conversation_id TEXT NOT NULL,
                        analysis_type TEXT NOT NULL,
                        results TEXT NOT NULL,
                        confidence REAL DEFAULT 0.0,
                        created_at TEXT NOT NULL DEFAULT (datetime('now')),
                        FOREIGN KEY (conversation_id) REFERENCES conversations (id) ON DELETE CASCADE
                    ) WITHOUT ROWID
                `
            },
            {
                name: 'patterns',
                sql: `
                    CREATE TABLE IF NOT EXISTS patterns (
                        id TEXT PRIMARY KEY,
                        pattern_type TEXT NOT NULL,
                        pattern_data TEXT NOT NULL,
                        frequency INTEGER DEFAULT 1,
                        confidence REAL DEFAULT 0.0,
                        first_seen TEXT NOT NULL,
                        last_seen TEXT NOT NULL,
                        created_at TEXT NOT NULL DEFAULT (datetime('now'))
                    ) WITHOUT ROWID
                `
            }
        ];

        for (const table of tables) {
            await this.run(table.sql);
            Logger.debug(`✅ Tabela criada: ${table.name}`);
        }
    }

    /**
     * Cria índices otimizados
     */
    async createIndexes() {
        const indexes = [
            'CREATE INDEX IF NOT EXISTS idx_conversations_start_time ON conversations(start_time)',
            'CREATE INDEX IF NOT EXISTS idx_conversations_status ON conversations(json_extract(metadata, "$.status"))',
            'CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id, timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_messages_timestamp ON messages(timestamp)',
            'CREATE INDEX IF NOT EXISTS idx_analysis_conversation ON analysis(conversation_id, analysis_type)',
            'CREATE INDEX IF NOT EXISTS idx_patterns_type ON patterns(pattern_type, confidence)'
        ];

        for (const indexSql of indexes) {
            await this.run(indexSql);
        }
    }

    /**
     * Atualiza métricas de performance
     */
    updateMetrics(queryTime) {
        this.metrics.queries++;
        this.metrics.totalQueryTime += queryTime;
        this.metrics.avgQueryTime = this.metrics.totalQueryTime / this.metrics.queries;
    }

    /**
     * Obtém estatísticas completas
     */
    async getDatabaseStats() {
        try {
            const stats = {
                connectionPool: {
                    total: this.connectionPool.connections.length,
                    active: this.connectionPool.activeConnections,
                    waiting: this.connectionPool.waitingQueue.length,
                    maxConnections: this.connectionPool.maxConnections
                },
                performance: {
                    queries: this.metrics.queries,
                    avgQueryTime: `${this.metrics.avgQueryTime.toFixed(2)}ms`,
                    cacheHits: this.metrics.cacheHits,
                    connectionReuses: this.metrics.connectionReuses,
                    hitRate: this.metrics.queries > 0 
                        ? `${((this.metrics.cacheHits / this.metrics.queries) * 100).toFixed(1)}%`
                        : '0%'
                },
                preparedStatements: this.preparedStatements.size,
                tables: {}
            };
            
            // Contadores de tabelas
            const tables = ['conversations', 'messages', 'analysis', 'patterns'];
            for (const table of tables) {
                try {
                    const result = await this.get(`SELECT COUNT(*) as count FROM ${table}`);
                    stats.tables[table] = result?.count || 0;
                } catch (error) {
                    stats.tables[table] = 0;
                }
            }

            // Tamanho do arquivo
            try {
                const dbStat = await fsNative.pathStat(this.dbPath);
                stats.databaseSize = dbStat ? dbStat.size : 0;
            } catch (error) {
                stats.databaseSize = 0;
            }
            
            return stats;
            
        } catch (error) {
            Logger.error('❌ Erro ao obter estatísticas:', error);
            return {};
        }
    }

    /**
     * Health check otimizado
     */
    async getHealth() {
        const stats = await this.getDatabaseStats();
        
        let status = 'healthy';
        const issues = [];

        // Check connection pool
        const poolUtilization = stats.connectionPool.active / stats.connectionPool.maxConnections;
        if (poolUtilization > 0.8) {
            status = 'warning';
            issues.push('High connection pool utilization');
        }

        // Check query performance
        const avgQueryTime = parseFloat(stats.performance.avgQueryTime);
        if (avgQueryTime > 100) {
            status = 'warning';
            issues.push('Slow average query time');
        }

        // Check waiting queue
        if (stats.connectionPool.waiting > 0) {
            status = 'degraded';
            issues.push('Connections waiting in queue');
        }

        return {
            status,
            issues,
            poolUtilization: `${(poolUtilization * 100).toFixed(1)}%`,
            avgQueryTime: stats.performance.avgQueryTime,
            cacheHitRate: stats.performance.hitRate
        };
    }

    /**
     * Cleanup e otimização periódica
     */
    async optimize() {
        Logger.info('🔧 Executando otimização do banco...');
        
        const startTime = Date.now();
        
        try {
            // VACUUM para reclamar espaço
            await this.run('VACUUM');
            
            // ANALYZE para atualizar estatísticas do query planner
            await this.run('ANALYZE');
            
            // PRAGMA optimize
            await this.run('PRAGMA optimize');
            
            const duration = Date.now() - startTime;
            Logger.info(`✅ Otimização concluída em ${duration}ms`);
            
        } catch (error) {
            Logger.error('❌ Erro durante otimização:', error);
        }
    }

    /**
     * Fecha todas as conexões
     */
    async close() {
        Logger.info('🔒 Fechando connection pool...');
        
        try {
            // Finalizar prepared statements
            for (const [name, prepared] of this.preparedStatements) {
                try {
                    prepared.statement.finalize();
                } catch (error) {
                    Logger.warn(`⚠️ Erro ao finalizar statement ${name}:`, error);
                }
            }
            this.preparedStatements.clear();
            
            // Fechar todas as conexões
            const closePromises = this.connectionPool.connections.map(connection => {
                return new Promise((resolve) => {
                    connection.db.close((err) => {
                        if (err) {
                            Logger.error('❌ Erro ao fechar conexão:', err);
                        }
                        resolve();
                    });
                });
            });
            
            await Promise.all(closePromises);
            
            // Reset do pool
            this.connectionPool.connections.length = 0;
            this.connectionPool.activeConnections = 0;
            this.connectionPool.waitingQueue.length = 0;
            
            this.isInitialized = false;
            Logger.info('✅ Database fechado');
            
        } catch (error) {
            Logger.error('❌ Erro ao fechar database:', error);
        }
    }
}

export default DatabaseManagerOptimized;