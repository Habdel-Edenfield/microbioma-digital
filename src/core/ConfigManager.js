/**
 * ⚙️ ConfigManager - Gerenciador de Configurações Simples do Microbioma Digital
 * 
 * Sistema de carregamento hierárquico de configurações com merge automático
 * 
 * @author Microbioma Digital Team
 * @version 0.1.1
 */

import fs from 'fs-extra';
import path from 'path';
import { LoggerStatic as Logger } from '../utils/Logger.js';

/**
 * Classe principal do ConfigManager
 */
class ConfigManager {
    constructor() {
        this.configDir = path.join(process.cwd(), 'config');
        this.config = null;
        this.environment = null;
        this.lastLoaded = null;
    }

    /**
     * Carrega todas as configurações do sistema
     */
    async load() {
        try {
            Logger.info('⚙️ Iniciando carregamento de configurações...');
            
            // Detectar ambiente
            this.environment = this.detectEnvironment();
            Logger.info(`🌍 Ambiente detectado: ${this.environment}`);
            
            // Carregar configurações base
            const baseConfig = await this.loadBaseConfig();
            Logger.info('✅ Configuração base carregada');
            
            // Carregar configuração específica do ambiente
            const envConfig = await this.loadEnvironmentConfig(this.environment);
            Logger.info(`✅ Configuração do ambiente ${this.environment} carregada`);
            
            // Carregar configuração local se existir
            const localConfig = await this.loadLocalConfig();
            if (localConfig) {
                Logger.info('✅ Configuração local carregada');
            }
            
            // Fazer merge das configurações
            this.config = this.mergeConfigs(baseConfig, envConfig, localConfig);
            Logger.info('✅ Configurações mescladas com sucesso');
            
            // Validação básica
            this.validateConfig(this.config);
            Logger.info('✅ Configurações validadas');
            
            this.lastLoaded = new Date();
            Logger.info('🎉 Carregamento de configurações concluído');
            
            return this.config;
            
        } catch (error) {
            Logger.error('❌ Erro ao carregar configurações:', error);
            throw error;
        }
    }

    /**
     * Detecta o ambiente atual
     */
    detectEnvironment() {
        if (process.env.NODE_ENV) {
            return process.env.NODE_ENV;
        }
        
        if (process.env.CI) {
            return 'test';
        }
        
        return 'development';
    }

    /**
     * Carrega configuração base
     */
    async loadBaseConfig() {
        try {
            const baseConfigPath = path.join(this.configDir, 'environment.json');
            const baseConfig = await fs.readJson(baseConfigPath);
            Logger.debug('Configuração base carregada', { path: baseConfigPath });
            return baseConfig;
        } catch (error) {
            Logger.warn('Configuração base não encontrada, usando padrões', error);
            return this.getDefaultBaseConfig();
        }
    }

    /**
     * Carrega configuração específica do ambiente
     */
    async loadEnvironmentConfig(environment) {
        try {
            const envConfigPath = path.join(this.configDir, `${environment}.json`);
            const envConfig = await fs.readJson(envConfigPath);
            Logger.debug(`Configuração do ambiente ${environment} carregada`, { path: envConfigPath });
            return envConfig;
        } catch (error) {
            Logger.warn(`Configuração do ambiente ${environment} não encontrada, usando padrões`, error);
            return this.getDefaultEnvironmentConfig(environment);
        }
    }

    /**
     * Carrega configuração local se existir
     */
    async loadLocalConfig() {
        try {
            const localConfigPath = path.join(this.configDir, 'local.json');
            const localConfig = await fs.readJson(localConfigPath);
            Logger.debug('Configuração local carregada', { path: localConfigPath });
            return localConfig;
        } catch (error) {
            Logger.debug('Configuração local não encontrada, continuando sem ela');
            return null;
        }
    }

    /**
     * Faz merge das configurações em ordem de prioridade
     */
    mergeConfigs(baseConfig, envConfig, localConfig) {
        let mergedConfig = { ...baseConfig };
        
        if (envConfig) {
            mergedConfig = this.deepMerge(mergedConfig, envConfig);
        }
        
        if (localConfig) {
            mergedConfig = this.deepMerge(mergedConfig, localConfig);
        }
        
        return mergedConfig;
    }

    /**
     * Merge profundo de objetos
     */
    deepMerge(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.deepMerge(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    }

    /**
     * Validação básica das configurações
     */
    validateConfig(config) {
        if (!config.paths) {
            throw new Error('Configuração de paths é obrigatória');
        }
        
        if (!config.database) {
            throw new Error('Configuração de database é obrigatória');
        }
    }

    /**
     * Obtém configuração atual
     */
    getConfig() {
        return this.config;
    }

    /**
     * Obtém valor específico da configuração
     */
    get(key, defaultValue = null) {
        if (!this.config) {
            return defaultValue;
        }
        
        const keys = key.split('.');
        let value = this.config;
        
        for (const k of keys) {
            if (value && typeof value === 'object' && k in value) {
                value = value[k];
            } else {
                return defaultValue;
            }
        }
        
        return value;
    }

    /**
     * Define valor na configuração
     */
    set(key, value) {
        if (!this.config) {
            this.config = {};
        }
        
        const keys = key.split('.');
        let current = this.config;
        
        for (let i = 0; i < keys.length - 1; i++) {
            const k = keys[i];
            if (!(k in current) || typeof current[k] !== 'object') {
                current[k] = {};
            }
            current = current[k];
        }
        
        current[keys[keys.length - 1]] = value;
        Logger.debug(`Configuração atualizada: ${key} = ${value}`);
    }

    /**
     * Configuração base padrão
     */
    getDefaultBaseConfig() {
        return {
            paths: {
                data: './data',
                docs: './docs',
                logs: './logs',
                temp: './temp',
                backups: './backups'
            },
            database: {
                type: 'sqlite',
                path: './data/microbioma.db',
                backup_path: './backups/database',
                auto_backup: true
            },
            logging: {
                file: './logs/microbioma.log',
                max_size: '10MB',
                max_files: 5,
                format: 'json'
            }
        };
    }

    /**
     * Configuração de ambiente padrão
     */
    getDefaultEnvironmentConfig(environment) {
        const defaults = {
            development: {
                mode: 'development',
                features: {
                    hot_reload: true,
                    debug_mode: true,
                    verbose_logging: true
                }
            },
            production: {
                mode: 'production',
                features: {
                    hot_reload: false,
                    debug_mode: false,
                    verbose_logging: false
                }
            },
            test: {
                mode: 'test',
                features: {
                    hot_reload: false,
                    debug_mode: true,
                    verbose_logging: true
                }
            }
        };
        
        return defaults[environment] || defaults.development;
    }
}

// Instância singleton do ConfigManager
const configManager = new ConfigManager();

// Exporta métodos estáticos para uso direto
export const ConfigManagerStatic = {
    load: () => configManager.load(),
    getConfig: () => configManager.getConfig(),
    get: (key, defaultValue) => configManager.get(key, defaultValue),
    set: (key, value) => configManager.set(key, value)
};

export default configManager;
