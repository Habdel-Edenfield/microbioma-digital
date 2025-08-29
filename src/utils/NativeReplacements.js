/**
 * 🔧 NativeReplacements - Substituições Nativas para Dependências Pesadas
 * 
 * Implementações otimizadas usando APIs nativas do Node.js
 * 
 * @author Microbioma Digital Team
 * @version 0.2.0
 */

import { readFile, writeFile, mkdir, readdir, stat, rm } from 'node:fs/promises';
import { existsSync, createReadStream, createWriteStream } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { createInterface } from 'node:readline';
import { parseArgs } from 'node:util';

// Substituição para 'fs-extra'
export const fsNative = {
    /**
     * Ensure directory exists
     */
    async ensureDir(dirPath) {
        try {
            await mkdir(dirPath, { recursive: true });
        } catch (error) {
            if (error.code !== 'EEXIST') {
                throw error;
            }
        }
    },

    /**
     * Copy file with streams (memory efficient)
     */
    async copyFile(src, dest) {
        await this.ensureDir(dirname(dest));
        
        return new Promise((resolve, reject) => {
            const readStream = createReadStream(src);
            const writeStream = createWriteStream(dest);
            
            readStream.on('error', reject);
            writeStream.on('error', reject);
            writeStream.on('finish', resolve);
            
            readStream.pipe(writeStream);
        });
    },

    /**
     * Read JSON file
     */
    async readJson(filePath) {
        const content = await readFile(filePath, 'utf8');
        return JSON.parse(content);
    },

    /**
     * Write JSON file
     */
    async writeJson(filePath, data, options = {}) {
        await this.ensureDir(dirname(filePath));
        const content = JSON.stringify(data, null, options.spaces || 2);
        await writeFile(filePath, content, 'utf8');
    },

    /**
     * Check if path exists
     */
    pathExists(filePath) {
        return existsSync(filePath);
    },

    /**
     * Remove file or directory
     */
    async remove(path) {
        if (existsSync(path)) {
            await rm(path, { recursive: true, force: true });
        }
    },

    /**
     * Get file stats
     */
    async pathStat(filePath) {
        try {
            return await stat(filePath);
        } catch (error) {
            return null;
        }
    },

    /**
     * List directory contents
     */
    async listDir(dirPath) {
        try {
            return await readdir(dirPath);
        } catch (error) {
            return [];
        }
    }
};

// Substituição para 'marked' (Markdown parser básico)
export const markdownNative = {
    /**
     * Parse markdown simples
     */
    parse(markdown) {
        return markdown
            // Headers
            .replace(/^### (.*$)/gm, '<h3>$1</h3>')
            .replace(/^## (.*$)/gm, '<h2>$1</h2>')
            .replace(/^# (.*$)/gm, '<h1>$1</h1>')
            // Bold/Italic
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            // Code blocks
            .replace(/```(.*?)```/gs, '<pre><code>$1</code></pre>')
            .replace(/`(.*?)`/g, '<code>$1</code>')
            // Links
            .replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2">$1</a>')
            // Line breaks
            .replace(/\n/g, '<br>');
    },

    /**
     * Convert to plain text
     */
    toPlainText(markdown) {
        return markdown
            .replace(/[#*`\[\]()]/g, '')
            .replace(/\n+/g, ' ')
            .trim();
    }
};

// Substituição para 'yaml'
export const yamlNative = {
    /**
     * Parse YAML básico
     */
    parse(yamlString) {
        const lines = yamlString.split('\n');
        const result = {};
        let currentKey = null;
        let indent = 0;

        for (const line of lines) {
            const trimmed = line.trim();
            if (!trimmed || trimmed.startsWith('#')) continue;

            const match = line.match(/^(\s*)([^:]+):\s*(.*)$/);
            if (match) {
                const [, spaces, key, value] = match;
                const currentIndent = spaces.length;

                if (value) {
                    // Simple key-value
                    result[key.trim()] = this.parseValue(value);
                } else {
                    // Nested object
                    currentKey = key.trim();
                    result[currentKey] = {};
                    indent = currentIndent;
                }
            }
        }

        return result;
    },

    /**
     * Parse value type
     */
    parseValue(value) {
        const trimmed = value.trim();
        
        if (trimmed === 'true') return true;
        if (trimmed === 'false') return false;
        if (trimmed === 'null') return null;
        if (/^\d+$/.test(trimmed)) return parseInt(trimmed);
        if (/^\d*\.\d+$/.test(trimmed)) return parseFloat(trimmed);
        
        return trimmed;
    },

    /**
     * Stringify object to YAML
     */
    stringify(obj) {
        const lines = [];
        
        for (const [key, value] of Object.entries(obj)) {
            if (typeof value === 'object' && value !== null) {
                lines.push(`${key}:`);
                for (const [subKey, subValue] of Object.entries(value)) {
                    lines.push(`  ${subKey}: ${subValue}`);
                }
            } else {
                lines.push(`${key}: ${value}`);
            }
        }
        
        return lines.join('\n');
    }
};

// Substituição para 'chalk' (cores no terminal)
export const colorsNative = {
    // ANSI color codes
    colors: {
        reset: '\x1b[0m',
        red: '\x1b[31m',
        green: '\x1b[32m',
        yellow: '\x1b[33m',
        blue: '\x1b[34m',
        magenta: '\x1b[35m',
        cyan: '\x1b[36m',
        white: '\x1b[37m',
        gray: '\x1b[90m'
    },

    red(text) {
        return `${this.colors.red}${text}${this.colors.reset}`;
    },

    green(text) {
        return `${this.colors.green}${text}${this.colors.reset}`;
    },

    yellow(text) {
        return `${this.colors.yellow}${text}${this.colors.reset}`;
    },

    blue(text) {
        return `${this.colors.blue}${text}${this.colors.reset}`;
    },

    cyan(text) {
        return `${this.colors.cyan}${text}${this.colors.reset}`;
    },

    gray(text) {
        return `${this.colors.gray}${text}${this.colors.reset}`;
    },

    bold(text) {
        return `\x1b[1m${text}\x1b[22m`;
    }
};

// Substituição para 'inquirer' (input do usuário)
export const promptNative = {
    /**
     * Simple text input
     */
    async input(message, defaultValue = '') {
        const rl = createInterface({
            input: process.stdin,
            output: process.stdout
        });

        return new Promise((resolve) => {
            const prompt = defaultValue ? `${message} (${defaultValue}): ` : `${message}: `;
            rl.question(prompt, (answer) => {
                rl.close();
                resolve(answer.trim() || defaultValue);
            });
        });
    },

    /**
     * Confirm (yes/no)
     */
    async confirm(message, defaultValue = false) {
        const answer = await this.input(
            `${message} (${defaultValue ? 'Y/n' : 'y/N'})`,
            defaultValue ? 'y' : 'n'
        );
        
        return ['y', 'yes', 'true', '1'].includes(answer.toLowerCase());
    },

    /**
     * Select from list
     */
    async select(message, choices) {
        console.log(message);
        choices.forEach((choice, index) => {
            console.log(`  ${index + 1}. ${choice}`);
        });

        const answer = await this.input('Select option (number)');
        const index = parseInt(answer) - 1;
        
        if (index >= 0 && index < choices.length) {
            return choices[index];
        }
        
        return choices[0]; // Default to first option
    }
};

// Substituição para 'node-cron' (scheduler simples)
export const cronNative = {
    scheduledTasks: new Map(),
    taskCounter: 0,

    /**
     * Schedule task (simplified cron)
     */
    schedule(cronExpression, task, options = {}) {
        const taskId = ++this.taskCounter;
        let interval;

        // Simplificado: apenas intervalos em minutos
        if (cronExpression.includes('*/')) {
            const minutes = parseInt(cronExpression.match(/\*\/(\d+)/)?.[1] || '1');
            interval = setInterval(task, minutes * 60 * 1000);
        } else {
            // Default: executar a cada minuto
            interval = setInterval(task, 60 * 1000);
        }

        const scheduledTask = {
            id: taskId,
            interval,
            task,
            created: new Date(),
            running: true
        };

        this.scheduledTasks.set(taskId, scheduledTask);
        
        return {
            id: taskId,
            destroy: () => this.destroyTask(taskId)
        };
    },

    /**
     * Destroy scheduled task
     */
    destroyTask(taskId) {
        const task = this.scheduledTasks.get(taskId);
        if (task) {
            clearInterval(task.interval);
            task.running = false;
            this.scheduledTasks.delete(taskId);
        }
    },

    /**
     * Get all scheduled tasks
     */
    getTasks() {
        return Array.from(this.scheduledTasks.values());
    },

    /**
     * Stop all tasks
     */
    destroyAll() {
        for (const [taskId] of this.scheduledTasks) {
            this.destroyTask(taskId);
        }
    }
};

// Utilitários adicionais
export const utilsNative = {
    /**
     * Deep clone object
     */
    deepClone(obj) {
        return JSON.parse(JSON.stringify(obj));
    },

    /**
     * Merge objects
     */
    mergeDeep(target, source) {
        const result = { ...target };
        
        for (const key in source) {
            if (source[key] && typeof source[key] === 'object' && !Array.isArray(source[key])) {
                result[key] = this.mergeDeep(result[key] || {}, source[key]);
            } else {
                result[key] = source[key];
            }
        }
        
        return result;
    },

    /**
     * Debounce function
     */
    debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    },

    /**
     * Throttle function
     */
    throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    },

    /**
     * Format bytes
     */
    formatBytes(bytes, decimals = 2) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
    }
};

export default {
    fs: fsNative,
    markdown: markdownNative,
    yaml: yamlNative,
    colors: colorsNative,
    prompt: promptNative,
    cron: cronNative,
    utils: utilsNative
};