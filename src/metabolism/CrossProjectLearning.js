/**
 * 🧠 CrossProjectLearning - Mary's Cross-Project Intelligence Engine
 * 
 * Sistema de aprendizado cruzado que extrai insights de múltiplos projetos
 * Implementa capacidades de meta-aprendizagem e transferência de conhecimento
 * 
 * @author Mary - Strategic Analyst + Microbioma Digital Team
 * @version 0.2.0 - Cross-Project Evolution
 */
import { LoggerStatic as Logger } from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import MemoryPool from '../core/MemoryPool.js';

class CrossProjectLearning {
    constructor(config = {}) {
        this.config = {
            maxProjectsToAnalyze: config.maxProjectsToAnalyze || 50,
            similarityThreshold: config.similarityThreshold || 0.7,
            learningWindowDays: config.learningWindowDays || 30,
            enableMetaPatternDetection: config.enableMetaPatternDetection !== false,
            enableKnowledgeTransfer: config.enableKnowledgeTransfer !== false,
            confidenceThreshold: config.confidenceThreshold || 0.6,
            ...config
        };

        // Cross-project data structures
        this.projectDatabase = new Map(); // Project patterns and insights
        this.metaPatterns = new Map(); // Meta-patterns across projects
        this.knowledgeGraph = new Map(); // Knowledge transfer graph
        this.transferHistory = new Map(); // Transfer success history
        
        // Event-driven integration
        this.eventBus = new EventBus({
            maxRetries: 3,
            bufferSize: 200,
            flushInterval: 100
        });

        // Memory pool for analysis objects
        this.memoryPool = new MemoryPool({
            initialSize: 30,
            maxSize: 100,
            objectFactory: () => ({
                patterns: [],
                insights: [],
                similarities: [],
                transfers: []
            })
        });

        // Mary's cross-project analytical traits
        this.analyticalMode = {
            metaLearning: true,
            patternAbstraction: true,
            knowledgeConnections: true,
            evolutiveLearning: true
        };

        Logger.info('🧠 Mary\'s CrossProjectLearning Engine - Meta-Intelligence Activated');
        this.emitEvent('cross_learning:initialized', { config: this.config });
    }

    /**
     * Mary's Core Cross-Project Analysis
     */
    async analyzeProjectPatterns(projectData) {
        const analysisObj = this.memoryPool.acquire();
        
        try {
            this.emitEvent('cross_learning:analysis:started', { projectId: projectData.id });
            Logger.info(`🔍 Mary cross-analyzing project: ${projectData.id}`);

            const crossAnalysis = {
                projectId: projectData.id,
                timestamp: new Date().toISOString(),
                patterns: await this.extractProjectPatterns(projectData),
                similarities: await this.findSimilarProjects(projectData),
                transferableInsights: await this.identifyTransferableInsights(projectData),
                metaLearnings: await this.extractMetaLearnings(projectData),
                recommendations: await this.generateCrossProjectRecommendations(projectData)
            };

            // Update project database
            this.updateProjectDatabase(projectData.id, crossAnalysis);
            
            // Update meta-patterns
            await this.updateMetaPatterns(crossAnalysis);
            
            this.emitEvent('cross_learning:analysis:completed', {
                projectId: projectData.id,
                patternsFound: crossAnalysis.patterns.length,
                similarProjects: crossAnalysis.similarities.length
            });

            Logger.info(`✅ Mary's cross-project analysis completed: ${projectData.id}`);
            return crossAnalysis;

        } catch (error) {
            this.emitEvent('cross_learning:error', { 
                projectId: projectData.id, 
                error: error.message 
            });
            Logger.error('❌ Cross-project analysis error:', error);
            throw error;
        } finally {
            this.memoryPool.release(analysisObj);
        }
    }

    /**
     * Extract patterns from project data
     */
    async extractProjectPatterns(projectData) {
        const patterns = [];

        // Architecture patterns
        const archPatterns = this.extractArchitecturePatterns(projectData);
        patterns.push(...archPatterns);

        // Technology stack patterns
        const techPatterns = this.extractTechnologyPatterns(projectData);
        patterns.push(...techPatterns);

        // Problem-solving patterns
        const problemPatterns = this.extractProblemSolvingPatterns(projectData);
        patterns.push(...problemPatterns);

        // Performance patterns
        const perfPatterns = this.extractPerformancePatterns(projectData);
        patterns.push(...perfPatterns);

        // Development workflow patterns
        const workflowPatterns = this.extractWorkflowPatterns(projectData);
        patterns.push(...workflowPatterns);

        return patterns;
    }

    /**
     * Find similar projects based on pattern analysis
     */
    async findSimilarProjects(projectData) {
        const similarities = [];
        const currentPatterns = await this.extractProjectPatterns(projectData);

        for (const [projectId, storedProject] of this.projectDatabase.entries()) {
            if (projectId === projectData.id) continue;

            const similarity = this.calculateProjectSimilarity(currentPatterns, storedProject.patterns);
            
            if (similarity >= this.config.similarityThreshold) {
                similarities.push({
                    projectId,
                    similarity,
                    sharedPatterns: this.findSharedPatterns(currentPatterns, storedProject.patterns),
                    transferPotential: this.assessTransferPotential(similarity)
                });
            }
        }

        // Sort by similarity descending
        return similarities.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * Identify insights that can be transferred between projects
     */
    async identifyTransferableInsights(projectData) {
        const transferableInsights = [];
        const similarProjects = await this.findSimilarProjects(projectData);

        for (const similar of similarProjects) {
            const sourceProject = this.projectDatabase.get(similar.projectId);
            if (!sourceProject) continue;

            // Architecture insights
            const archInsights = this.identifyTransferableArchitecture(projectData, sourceProject);
            transferableInsights.push(...archInsights);

            // Performance optimizations
            const perfInsights = this.identifyTransferableOptimizations(projectData, sourceProject);
            transferableInsights.push(...perfInsights);

            // Best practices
            const practiceInsights = this.identifyTransferablePractices(projectData, sourceProject);
            transferableInsights.push(...practiceInsights);

            // Problem solutions
            const solutionInsights = this.identifyTransferableSolutions(projectData, sourceProject);
            transferableInsights.push(...solutionInsights);
        }

        return this.rankTransferableInsights(transferableInsights);
    }

    /**
     * Extract meta-learnings that apply across multiple projects
     */
    async extractMetaLearnings(projectData) {
        const metaLearnings = [];

        // Development process meta-patterns
        if (this.analyticalMode.metaLearning) {
            const processLearnings = this.extractProcessMetaLearnings(projectData);
            metaLearnings.push(...processLearnings);

            // Technology adoption meta-patterns
            const techLearnings = this.extractTechnologyMetaLearnings(projectData);
            metaLearnings.push(...techLearnings);

            // Problem-solving meta-patterns
            const problemLearnings = this.extractProblemSolvingMetaLearnings(projectData);
            metaLearnings.push(...problemLearnings);
        }

        return metaLearnings;
    }

    /**
     * Generate cross-project recommendations
     */
    async generateCrossProjectRecommendations(projectData) {
        const recommendations = [];
        const similarities = await this.findSimilarProjects(projectData);
        const transferableInsights = await this.identifyTransferableInsights(projectData);

        // Similar project recommendations
        if (similarities.length > 0) {
            recommendations.push({
                type: 'similar_projects',
                priority: 'high',
                title: `${similarities.length} Similar Projects Found`,
                description: 'Learn from similar project patterns and solutions',
                evidence: similarities.slice(0, 3),
                action: 'analyze_similar_patterns'
            });
        }

        // Knowledge transfer recommendations
        if (transferableInsights.length > 0) {
            recommendations.push({
                type: 'knowledge_transfer',
                priority: 'medium',
                title: `${transferableInsights.length} Transferable Insights Available`,
                description: 'Apply proven solutions from similar projects',
                evidence: transferableInsights.slice(0, 5),
                action: 'implement_transferable_insights'
            });
        }

        // Meta-pattern recommendations
        const metaPatterns = Array.from(this.metaPatterns.values())
            .filter(pattern => pattern.confidence > this.config.confidenceThreshold);
            
        if (metaPatterns.length > 0) {
            recommendations.push({
                type: 'meta_patterns',
                priority: 'medium',
                title: 'Meta-Pattern Opportunities',
                description: 'Apply cross-project meta-patterns for better outcomes',
                evidence: metaPatterns.slice(0, 3),
                action: 'apply_meta_patterns'
            });
        }

        return recommendations;
    }

    // ===== PATTERN EXTRACTION METHODS =====

    extractArchitecturePatterns(projectData) {
        const patterns = [];
        const conversations = projectData.conversations || [];

        conversations.forEach(conv => {
            const messages = conv.messages || [];
            const archKeywords = [
                'microservices', 'monolith', 'event-driven', 'serverless',
                'api', 'rest', 'graphql', 'websocket', 'database',
                'cache', 'queue', 'stream'
            ];

            messages.forEach(msg => {
                const content = (msg.content || '').toLowerCase();
                archKeywords.forEach(keyword => {
                    if (content.includes(keyword)) {
                        patterns.push({
                            type: 'architecture',
                            pattern: keyword,
                            context: content.substring(0, 100) + '...',
                            frequency: 1,
                            source: conv.id
                        });
                    }
                });
            });
        });

        return this.consolidatePatterns(patterns);
    }

    extractTechnologyPatterns(projectData) {
        const patterns = [];
        const techStacks = [
            'javascript', 'python', 'java', 'golang', 'rust',
            'react', 'vue', 'angular', 'node', 'express',
            'postgresql', 'mongodb', 'redis', 'elasticsearch',
            'docker', 'kubernetes', 'aws', 'azure', 'gcp'
        ];

        // Extract technology patterns from conversations
        const conversations = projectData.conversations || [];
        conversations.forEach(conv => {
            const messages = conv.messages || [];
            messages.forEach(msg => {
                const content = (msg.content || '').toLowerCase();
                techStacks.forEach(tech => {
                    if (content.includes(tech)) {
                        patterns.push({
                            type: 'technology',
                            pattern: tech,
                            context: content.substring(0, 80) + '...',
                            source: conv.id
                        });
                    }
                });
            });
        });

        return this.consolidatePatterns(patterns);
    }

    extractProblemSolvingPatterns(projectData) {
        const patterns = [];
        const conversations = projectData.conversations || [];

        conversations.forEach(conv => {
            const messages = conv.messages || [];
            let problemPhase = null;
            
            messages.forEach(msg => {
                const content = (msg.content || '').toLowerCase();
                
                // Problem identification
                if (content.includes('erro') || content.includes('problema') || content.includes('bug')) {
                    problemPhase = 'identification';
                    patterns.push({
                        type: 'problem_solving',
                        pattern: 'problem_identification',
                        phase: problemPhase,
                        source: conv.id
                    });
                }
                
                // Solution attempt
                if (problemPhase && content.includes('tentar') || content.includes('solução')) {
                    patterns.push({
                        type: 'problem_solving',
                        pattern: 'solution_attempt',
                        phase: 'solving',
                        source: conv.id
                    });
                }
                
                // Resolution
                if (problemPhase && (content.includes('resolvido') || content.includes('funciona'))) {
                    patterns.push({
                        type: 'problem_solving',
                        pattern: 'resolution',
                        phase: 'resolution',
                        source: conv.id
                    });
                    problemPhase = null;
                }
            });
        });

        return patterns;
    }

    extractPerformancePatterns(projectData) {
        const patterns = [];
        const perfKeywords = [
            'performance', 'otimização', 'latência', 'throughput',
            'cache', 'indexing', 'lazy loading', 'pagination',
            'compression', 'minification', 'cdn'
        ];

        const conversations = projectData.conversations || [];
        conversations.forEach(conv => {
            const messages = conv.messages || [];
            messages.forEach(msg => {
                const content = (msg.content || '').toLowerCase();
                perfKeywords.forEach(keyword => {
                    if (content.includes(keyword)) {
                        patterns.push({
                            type: 'performance',
                            pattern: keyword,
                            context: content.substring(0, 100) + '...',
                            source: conv.id
                        });
                    }
                });
            });
        });

        return this.consolidatePatterns(patterns);
    }

    extractWorkflowPatterns(projectData) {
        const patterns = [];
        const workflowKeywords = [
            'git', 'commit', 'pull request', 'code review',
            'testing', 'deployment', 'ci/cd', 'docker',
            'staging', 'production', 'rollback'
        ];

        const conversations = projectData.conversations || [];
        conversations.forEach(conv => {
            const messages = conv.messages || [];
            messages.forEach(msg => {
                const content = (msg.content || '').toLowerCase();
                workflowKeywords.forEach(keyword => {
                    if (content.includes(keyword)) {
                        patterns.push({
                            type: 'workflow',
                            pattern: keyword,
                            context: content.substring(0, 80) + '...',
                            source: conv.id
                        });
                    }
                });
            });
        });

        return this.consolidatePatterns(patterns);
    }

    // ===== UTILITY METHODS =====

    consolidatePatterns(patterns) {
        const consolidated = new Map();
        
        patterns.forEach(pattern => {
            const key = `${pattern.type}:${pattern.pattern}`;
            if (consolidated.has(key)) {
                const existing = consolidated.get(key);
                existing.frequency += 1;
                existing.sources.push(pattern.source);
            } else {
                consolidated.set(key, {
                    ...pattern,
                    frequency: 1,
                    sources: [pattern.source]
                });
            }
        });

        return Array.from(consolidated.values());
    }

    calculateProjectSimilarity(patterns1, patterns2) {
        if (!patterns1.length || !patterns2.length) return 0;

        const set1 = new Set(patterns1.map(p => `${p.type}:${p.pattern}`));
        const set2 = new Set(patterns2.map(p => `${p.type}:${p.pattern}`));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    findSharedPatterns(patterns1, patterns2) {
        const shared = [];
        const map1 = new Map(patterns1.map(p => [`${p.type}:${p.pattern}`, p]));
        
        patterns2.forEach(p2 => {
            const key = `${p2.type}:${p2.pattern}`;
            if (map1.has(key)) {
                shared.push({
                    type: p2.type,
                    pattern: p2.pattern,
                    frequency1: map1.get(key).frequency,
                    frequency2: p2.frequency
                });
            }
        });
        
        return shared;
    }

    assessTransferPotential(similarity) {
        if (similarity >= 0.9) return 'very_high';
        if (similarity >= 0.8) return 'high';
        if (similarity >= 0.7) return 'medium';
        return 'low';
    }

    // Event emission helper
    emitEvent(eventType, data) {
        if (this.eventBus) {
            this.eventBus.emit(eventType, data);
        }
    }

    // Database update methods
    updateProjectDatabase(projectId, analysis) {
        this.projectDatabase.set(projectId, {
            patterns: analysis.patterns,
            lastAnalyzed: analysis.timestamp,
            similarity: analysis.similarities,
            insights: analysis.transferableInsights
        });
    }

    async updateMetaPatterns(analysis) {
        // Update meta-patterns based on new analysis
        analysis.patterns.forEach(pattern => {
            const metaKey = `${pattern.type}:${pattern.pattern}`;
            
            if (this.metaPatterns.has(metaKey)) {
                const existing = this.metaPatterns.get(metaKey);
                existing.frequency += 1;
                existing.projects.add(analysis.projectId);
                existing.confidence = existing.projects.size / this.projectDatabase.size;
            } else {
                this.metaPatterns.set(metaKey, {
                    type: pattern.type,
                    pattern: pattern.pattern,
                    frequency: 1,
                    projects: new Set([analysis.projectId]),
                    confidence: 1 / Math.max(this.projectDatabase.size, 1)
                });
            }
        });
    }

    // Placeholder methods for transferable insights (to be expanded)
    identifyTransferableArchitecture(project, sourceProject) { return []; }
    identifyTransferableOptimizations(project, sourceProject) { return []; }
    identifyTransferablePractices(project, sourceProject) { return []; }
    identifyTransferableSolutions(project, sourceProject) { return []; }
    
    rankTransferableInsights(insights) {
        return insights.sort((a, b) => (b.confidence || 0) - (a.confidence || 0));
    }

    extractProcessMetaLearnings(projectData) { return []; }
    extractTechnologyMetaLearnings(projectData) { return []; }
    extractProblemSolvingMetaLearnings(projectData) { return []; }

    /**
     * Get cross-project learning statistics
     */
    getLearningStats() {
        return {
            totalProjects: this.projectDatabase.size,
            metaPatterns: this.metaPatterns.size,
            knowledgeConnections: this.knowledgeGraph.size,
            transferHistory: this.transferHistory.size
        };
    }
}

export default CrossProjectLearning;