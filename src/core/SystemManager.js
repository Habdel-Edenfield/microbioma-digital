/**
 * 🧬 SystemManager - Gerenciador Simples do Sistema Microbioma Digital
 * 
 * Coordena a inicialização básica do sistema
 * 
 * @author Microbioma Digital Team
 * @version 0.1.1
 */

import { LoggerStatic as Logger } from '../utils/Logger.js';
import fs from 'fs-extra';
import path from 'path';

/**
 * Classe principal do SystemManager
 */
class SystemManager {
    constructor(config) {
        this.config = config;
        this.isRunning = false;
        this.startTime = null;
    }

    /**
     * Inicializa o sistema
     */
    async initialize() {
        try {
            Logger.info('🚀 Inicializando sistema Microbioma Digital...');
            
            if (this.isRunning) {
                Logger.warn('⚠️ Sistema já está rodando');
                return;
            }
            
            // Validar configuração
            if (!this.config) {
                throw new Error('Configuração não fornecida');
            }
            
            Logger.info('✅ Configuração validada');
            
            // Inicializar componentes básicos
            await this.initializeComponents();
            Logger.info('✅ Componentes básicos inicializados');
            
            // Marcar sistema como inicializado
            this.isRunning = true;
            this.startTime = new Date();
            
            Logger.info('🎉 Sistema Microbioma Digital inicializado com sucesso!');
            
        } catch (error) {
            Logger.error('❌ Erro ao inicializar sistema:', error);
            throw error;
        }
    }

    /**
     * Inicia o sistema
     */
    async start() {
        try {
            Logger.info('🚀 Iniciando sistema Microbioma Digital...');
            
            if (this.isRunning) {
                Logger.warn('⚠️ Sistema já está rodando');
                return;
            }
            
            // Validar configuração
            if (!this.config) {
                throw new Error('Configuração não fornecida');
            }
            
            Logger.info('✅ Configuração validada');
            
            // Inicializar componentes básicos
            await this.initializeComponents();
            Logger.info('✅ Componentes básicos inicializados');
            
            // Marcar sistema como rodando
            this.isRunning = true;
            this.startTime = new Date();
            
            Logger.info('🎉 Sistema Microbioma Digital iniciado com sucesso!');
            
        } catch (error) {
            Logger.error('❌ Erro ao iniciar sistema:', error);
            throw error;
        }
    }

    /**
     * Para o sistema gracefulmente
     */
    async stop() {
        try {
            Logger.info('🛑 Parando sistema Microbioma Digital...');
            
            if (!this.isRunning) {
                Logger.warn('⚠️ Sistema não está rodando');
                return;
            }
            
            // Limpar recursos
            await this.cleanup();
            Logger.info('✅ Recursos limpos');
            
            // Marcar sistema como parado
            this.isRunning = false;
            
            Logger.info('✅ Sistema parado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao parar sistema:', error);
            throw error;
        }
    }

    /**
     * Inicializa componentes básicos
     */
    async initializeComponents() {
        try {
            // Criar diretórios necessários
            await this.createRequiredDirectories();
            Logger.info('✅ Diretórios necessários criados');
            
            // Inicializar sistema de logging
            await this.initializeLogging();
            Logger.info('✅ Sistema de logging inicializado');
            
            // Configurar sistema de backup
            await this.initializeBackupSystem();
            Logger.info('✅ Sistema de backup configurado');
            
        } catch (error) {
            Logger.error('❌ Erro ao inicializar componentes:', error);
            throw error;
        }
    }

    /**
     * Cria diretórios necessários
     */
    async createRequiredDirectories() {
        try {
            const requiredDirs = [
                this.config.paths.data,
                this.config.paths.docs,
                this.config.paths.logs,
                this.config.paths.temp,
                this.config.paths.backups
            ];
            
            for (const dir of requiredDirs) {
                await fs.ensureDir(dir);
                Logger.debug(`Diretório criado/verificado: ${dir}`);
            }
            
        } catch (error) {
            Logger.error('❌ Erro ao criar diretórios:', error);
            throw error;
        }
    }

    /**
     * Inicializa sistema de logging
     */
    async initializeLogging() {
        try {
            await fs.ensureDir(this.config.paths.logs);
            Logger.info('✅ Sistema de logging funcionando corretamente');
            
        } catch (error) {
            Logger.error('❌ Erro ao inicializar sistema de logging:', error);
            throw error;
        }
    }

    /**
     * Inicializa sistema de backup
     */
    async initializeBackupSystem() {
        try {
            await fs.ensureDir(this.config.paths.backups);
            
            // Criar estrutura de backup básica
            const backupDirs = ['database', 'files', 'config'];
            for (const dir of backupDirs) {
                await fs.ensureDir(path.join(this.config.paths.backups, dir));
            }
            
            Logger.info('✅ Sistema de backup configurado');
            
        } catch (error) {
            Logger.error('❌ Erro ao configurar sistema de backup:', error);
            throw error;
        }
    }

    /**
     * Limpa recursos do sistema
     */
    async cleanup() {
        try {
            Logger.info('✅ Recursos limpos');
            
        } catch (error) {
            Logger.error('❌ Erro ao limpar recursos:', error);
        }
    }

    /**
     * Obtém status do sistema
     */
    getSystemStatus() {
        return {
            isRunning: this.isRunning,
            startTime: this.startTime,
            config: this.config ? 'loaded' : 'not_loaded',
            timestamp: new Date().toISOString()
        };
    }

    /**
     * Reinicia o sistema
     */
    async restart() {
        try {
            Logger.info('🔄 Reiniciando sistema...');
            
            await this.stop();
            await this.start();
            
            Logger.info('✅ Sistema reiniciado com sucesso');
            
        } catch (error) {
            Logger.error('❌ Erro ao reiniciar sistema:', error);
            throw error;
        }
    }
}

export default SystemManager;
