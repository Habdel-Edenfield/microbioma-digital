/**
 * 📝 Logger - Sistema de Logging Simples do Microbioma Digital
 * 
 * Sistema de logging básico com rotação automática e formatação JSON
 * 
 * @author Microbioma Digital Team
 * @version 0.1.1
 */

import fs from 'fs-extra';
import path from 'path';

/**
 * Níveis de log disponíveis
 */
export const LogLevel = {
    DEBUG: 0,
    INFO: 1,
    WARN: 2,
    ERROR: 3
};

/**
 * Nomes dos níveis de log
 */
export const LogLevelNames = {
    [LogLevel.DEBUG]: 'DEBUG',
    [LogLevel.INFO]: 'INFO',
    [LogLevel.WARN]: 'WARN',
    [LogLevel.ERROR]: 'ERROR'
};

/**
 * Classe principal do Logger
 */
class Logger {
    constructor() {
        this.logDir = path.join(process.cwd(), 'logs');
        this.currentLogFile = null;
        this.currentDate = null;
        this.ensureLogDirectory();
        this.rotateLogFile();
    }

    /**
     * Garante que o diretório de logs existe
     */
    async ensureLogDirectory() {
        try {
            await fs.ensureDir(this.logDir);
        } catch (error) {
            console.error('❌ Erro ao criar diretório de logs:', error);
        }
    }

    /**
     * Rotaciona o arquivo de log se necessário
     */
    rotateLogFile() {
        const today = new Date().toISOString().split('T')[0];
        
        if (this.currentDate !== today) {
            this.currentDate = today;
            this.currentLogFile = path.join(this.logDir, `microbioma-${today}.log`);
        }
    }

    /**
     * Formata uma mensagem de log
     */
    formatLog(level, message, data = null) {
        const logEntry = {
            timestamp: new Date().toISOString(),
            level: LogLevelNames[level],
            message: message,
            data: data
        };

        return JSON.stringify(logEntry) + '\n';
    }

    /**
     * Escreve log no arquivo
     */
    async writeLog(level, message, data = null) {
        try {
            this.rotateLogFile();
            
            const logEntry = this.formatLog(level, message, data);
            
            await fs.appendFile(this.currentLogFile, logEntry);
            
            // Também escreve no console para desenvolvimento
            if (process.env.NODE_ENV !== 'production') {
                console.log(`${LogLevelNames[level]}: ${message}`);
                if (data) {
                    console.log('📊 Dados:', data);
                }
            }
            
        } catch (error) {
            console.error('❌ Erro ao escrever log:', error);
        }
    }

    /**
     * Log de debug
     */
    debug(message, data = null) {
        this.writeLog(LogLevel.DEBUG, message, data);
    }

    /**
     * Log de informação
     */
    info(message, data = null) {
        this.writeLog(LogLevel.INFO, message, data);
    }

    /**
     * Log de aviso
     */
    warn(message, data = null) {
        this.writeLog(LogLevel.WARN, message, data);
    }

    /**
     * Log de erro
     */
    error(message, data = null) {
        this.writeLog(LogLevel.ERROR, message, data);
    }
}

// Instância singleton do logger
const logger = new Logger();

// Exporta métodos estáticos para uso direto
export const LoggerStatic = {
    debug: (message, data) => logger.debug(message, data),
    info: (message, data) => logger.info(message, data),
    warn: (message, data) => logger.warn(message, data),
    error: (message, data) => logger.error(message, data)
};

export default logger;
