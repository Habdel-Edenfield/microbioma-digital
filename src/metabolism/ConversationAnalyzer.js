/**
 * 🧠 ConversationAnalyzer - Mary's Strategic Intelligence Engine
 * 
 * Sistema de análise semântica avançada que transforma conversas em insights estratégicos
 * Integrado com Mary's analytical capabilities para parceria cognitiva otimizada
 * 
 * @author Mary - Strategic Analyst + Microbioma Digital Team
 * @version 0.2.0 - Strategic Intelligence Evolution
 */
import { LoggerStatic as Logger } from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import MemoryPool from '../core/MemoryPool.js';

class ConversationAnalyzer {
    constructor(config = {}) {
        this.config = {
            analysisDepth: config.analysisDepth || 'strategic',
            enableSentiment: config.enableSentiment !== false,
            enableTopicDetection: config.enableTopicDetection !== false,
            enablePatternRecognition: config.enablePatternRecognition !== false,
            enableStrategicInsights: config.enableStrategicInsights !== false,
            enableCrossProjectLearning: config.enableCrossProjectLearning !== false,
            semanticAnalysis: config.semanticAnalysis !== false,
            ...config
        };
        
        // Mary's Strategic Intelligence Components
        this.analysisCache = new Map();
        this.patternDatabase = new Map();
        this.strategicInsights = new Map();
        this.crossProjectPatterns = new Map();
        
        // Event-driven integration
        this.eventBus = new EventBus({
            maxRetries: 3,
            bufferSize: 500,
            flushInterval: 50
        });
        
        // Memory pool for analysis objects
        this.memoryPool = new MemoryPool({
            initialSize: 50,
            maxSize: 200,
            objectFactory: () => ({
                insights: {},
                patterns: {},
                strategies: {},
                recommendations: []
            })
        });
        
        // Mary's analytical personality traits
        this.analyticalMode = {
            curiosityDriven: true,
            evidenceBased: true,
            strategicContext: true,
            iterativeRefinement: true
        };
        
        Logger.info('🧠 Mary\'s ConversationAnalyzer - Strategic Intelligence Activated');
        this.emitEvent('analyzer:initialized', { config: this.config });
    }

    /**
     * Mary's Strategic Conversation Analysis - Core Intelligence Engine
     */
    async analyzeConversation(conversation) {
        const analysisObj = this.memoryPool.acquire();
        
        try {
            this.emitEvent('analysis:started', { conversationId: conversation.id });
            Logger.info(`🔍 Mary analyzing conversation: ${conversation.id}`);
            
            const analysis = {
                conversationId: conversation.id,
                timestamp: new Date().toISOString(),
                metadata: {},
                insights: {},
                patterns: {},
                strategicAnalysis: {},
                crossProjectInsights: {},
                summary: {},
                maryRecommendations: []
            };

            // Mary's Multi-Layer Strategic Analysis
            analysis.metadata = await this.analyzeMetadata(conversation);
            analysis.insights = await this.analyzeContent(conversation);
            analysis.patterns = await this.detectPatterns(conversation);
            
            // NEW: Strategic Intelligence Layer
            analysis.strategicAnalysis = await this.performStrategicAnalysis(conversation, analysis);
            
            // NEW: Cross-Project Learning Layer
            analysis.crossProjectInsights = await this.analyzeCrossProjectPatterns(conversation);
            
            // NEW: Mary's Evidence-Based Recommendations
            analysis.maryRecommendations = await this.generateStrategicRecommendations(analysis);
            
            // Enhanced Summary with Strategic Context
            analysis.summary = await this.generateStrategicSummary(analysis);
            
            // Cache and emit analysis completion
            this.analysisCache.set(conversation.id, analysis);
            this.updateStrategicDatabase(analysis);
            
            this.emitEvent('analysis:completed', { 
                conversationId: conversation.id,
                insights: analysis.insights.topics,
                strategicValue: analysis.strategicAnalysis.priority
            });
            
            Logger.info(`✅ Mary's strategic analysis completed: ${conversation.id}`);
            return analysis;
            
        } catch (error) {
            this.emitEvent('analysis:error', { conversationId: conversation.id, error: error.message });
            Logger.error('❌ Mary analysis error:', error);
            throw error;
        } finally {
            this.memoryPool.release(analysisObj);
        }
    }

    /**
     * Analisa metadados básicos da conversa
     */
    async analyzeMetadata(conversation) {
        const metadata = {
            duration: this.calculateDuration(conversation.startTime, conversation.endTime),
            messageCount: conversation.messages?.length || 0,
            participants: this.extractParticipants(conversation.messages),
            context: conversation.context || {},
            intensity: this.calculateIntensity(conversation.messages)
        };

        return metadata;
    }

    /**
     * Analisa o conteúdo das mensagens
     */
    async analyzeContent(conversation) {
        if (!conversation.messages || conversation.messages.length === 0) {
            return { contentAnalysis: 'no_messages' };
        }

        const insights = {
            topics: await this.detectTopics(conversation.messages),
            sentiment: await this.analyzeSentiment(conversation.messages),
            technicalContent: this.analyzeTechnicalContent(conversation.messages),
            interactionPatterns: this.analyzeInteractionPatterns(conversation.messages),
            knowledgeGaps: this.identifyKnowledgeGaps(conversation.messages)
        };

        return insights;
    }

    /**
     * Detecta padrões na conversa
     */
    async detectPatterns(conversation) {
        const patterns = {
            recurringThemes: this.findRecurringThemes(conversation.messages),
            problemSolvingPatterns: this.analyzeProblemSolving(conversation.messages),
            collaborationPatterns: this.analyzeCollaboration(conversation.messages),
            learningPatterns: this.analyzeLearningPatterns(conversation.messages)
        };

        return patterns;
    }

    /**
     * Gera resumo da análise
     */
    async generateSummary(analysis) {
        const summary = {
            keyInsights: this.extractKeyInsights(analysis),
            recommendations: this.generateRecommendations(analysis),
            nextSteps: this.suggestNextSteps(analysis),
            confidence: this.calculateConfidence(analysis)
        };

        return summary;
    }

    // ===== MARY'S STRATEGIC INTELLIGENCE METHODS =====

    /**
     * Mary's Strategic Analysis - Evidence-based strategic insights
     */
    async performStrategicAnalysis(conversation, basicAnalysis) {
        const strategic = {
            priority: this.assessStrategicPriority(basicAnalysis),
            developmentPhase: this.identifyDevelopmentPhase(conversation),
            opportunityAssessment: this.assessOpportunities(basicAnalysis),
            riskAnalysis: this.analyzeRisks(basicAnalysis),
            competitiveInsights: this.extractCompetitiveInsights(conversation),
            marketContext: this.analyzeMarketContext(conversation),
            strategicRecommendations: []
        };

        // Mary's curiosity-driven deeper analysis
        if (this.analyticalMode.curiosityDriven) {
            strategic.unexploredOpportunities = this.identifyUnexploredOpportunities(basicAnalysis);
            strategic.emergentPatterns = this.detectEmergentStrategicPatterns(conversation);
        }

        this.emitEvent('strategic:analysis:completed', { 
            conversationId: conversation.id, 
            priority: strategic.priority 
        });

        return strategic;
    }

    /**
     * Cross-Project Pattern Analysis - Learning across projects
     */
    async analyzeCrossProjectPatterns(conversation) {
        const crossProject = {
            similarPatterns: this.findSimilarPatterns(conversation),
            transferableInsights: this.identifyTransferableInsights(conversation),
            metaLearnings: this.extractMetaLearnings(conversation),
            bestPractices: this.identifyBestPractices(conversation),
            antiPatterns: this.detectAntiPatterns(conversation)
        };

        // Update cross-project learning database
        this.updateCrossProjectDatabase(conversation, crossProject);

        return crossProject;
    }

    /**
     * Mary's Evidence-Based Strategic Recommendations
     */
    async generateStrategicRecommendations(analysis) {
        const recommendations = [];

        // Evidence-based recommendation generation
        if (analysis.strategicAnalysis.priority === 'high') {
            recommendations.push({
                type: 'strategic',
                priority: 'high',
                title: 'High-Value Development Opportunity',
                description: 'This conversation indicates high strategic value. Consider prioritizing.',
                evidence: analysis.strategicAnalysis.opportunityAssessment,
                nextSteps: this.generateHighPriorityNextSteps(analysis)
            });
        }

        // Knowledge gap recommendations
        if (analysis.insights.knowledgeGaps && analysis.insights.knowledgeGaps.length > 0) {
            recommendations.push({
                type: 'learning',
                priority: 'medium',
                title: 'Knowledge Enhancement Opportunity',
                description: `${analysis.insights.knowledgeGaps.length} knowledge gaps identified`,
                evidence: analysis.insights.knowledgeGaps,
                nextSteps: this.generateLearningNextSteps(analysis.insights.knowledgeGaps)
            });
        }

        // Cross-project learning recommendations
        if (analysis.crossProjectInsights.transferableInsights.length > 0) {
            recommendations.push({
                type: 'knowledge_transfer',
                priority: 'medium',
                title: 'Cross-Project Learning Opportunity',
                description: 'Insights from this conversation could benefit other projects',
                evidence: analysis.crossProjectInsights.transferableInsights,
                nextSteps: ['Document transferable patterns', 'Create knowledge sharing session']
            });
        }

        return recommendations;
    }

    /**
     * Enhanced Strategic Summary with Mary's analytical perspective
     */
    async generateStrategicSummary(analysis) {
        const summary = {
            // Basic insights (enhanced)
            keyInsights: this.extractKeyInsights(analysis),
            strategicInsights: this.extractStrategicInsights(analysis),
            
            // Mary's strategic perspective
            strategicValue: analysis.strategicAnalysis.priority,
            developmentImplications: this.analyzeDevelopmentImplications(analysis),
            
            // Evidence-based recommendations
            recommendations: analysis.maryRecommendations,
            
            // Next steps with strategic context
            nextSteps: this.generateStrategicNextSteps(analysis),
            
            // Confidence with strategic factors
            confidence: this.calculateStrategicConfidence(analysis),
            
            // Mary's analytical summary
            maryAnalysis: this.generateMaryAnalyticalSummary(analysis)
        };

        return summary;
    }

    // ===== STRATEGIC ANALYSIS HELPER METHODS =====

    assessStrategicPriority(analysis) {
        let score = 0;
        
        // Technical complexity indicates strategic importance
        if (analysis.insights.technicalContent.technicalLevel === 'advanced') score += 3;
        else if (analysis.insights.technicalContent.technicalLevel === 'intermediate') score += 2;
        
        // Multiple topics suggest broader strategic impact
        if (analysis.insights.topics.length > 3) score += 2;
        
        // Knowledge gaps represent learning opportunities
        if (analysis.insights.knowledgeGaps.length > 0) score += 1;
        
        // Problem-solving patterns indicate critical work
        if (analysis.patterns.problemSolvingPatterns.problemIdentification > 0) score += 2;
        
        if (score >= 6) return 'high';
        if (score >= 3) return 'medium';
        return 'low';
    }

    identifyDevelopmentPhase(conversation) {
        const context = conversation.context ? JSON.parse(conversation.context) : {};
        const messages = conversation.messages || [];
        
        // Analyze message content for phase indicators
        const phaseIndicators = {
            planning: ['arquitetura', 'design', 'plano', 'estrutura'],
            development: ['implementar', 'código', 'função', 'classe'],
            testing: ['teste', 'bug', 'erro', 'debug'],
            optimization: ['performance', 'otimizar', 'melhorar'],
            deployment: ['deploy', 'produção', 'publicar']
        };

        const phaseScores = {};
        Object.keys(phaseIndicators).forEach(phase => {
            phaseScores[phase] = 0;
        });

        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            Object.entries(phaseIndicators).forEach(([phase, indicators]) => {
                indicators.forEach(indicator => {
                    if (content.includes(indicator)) {
                        phaseScores[phase]++;
                    }
                });
            });
        });

        // Return phase with highest score
        const dominantPhase = Object.entries(phaseScores)
            .reduce((a, b) => phaseScores[a[0]] > phaseScores[b[0]] ? a : b);

        return {
            currentPhase: dominantPhase[0],
            confidence: dominantPhase[1] / messages.length,
            allScores: phaseScores
        };
    }

    assessOpportunities(analysis) {
        const opportunities = [];

        // Learning opportunities from knowledge gaps
        if (analysis.insights.knowledgeGaps.length > 0) {
            opportunities.push({
                type: 'learning',
                description: 'Knowledge enhancement opportunities identified',
                impact: 'medium',
                effort: 'low'
            });
        }

        // Optimization opportunities from technical content
        if (analysis.insights.technicalContent.technicalScore > 2) {
            opportunities.push({
                type: 'optimization',
                description: 'Technical optimization opportunities',
                impact: 'high',
                effort: 'medium'
            });
        }

        // Process improvement opportunities
        if (analysis.patterns.problemSolvingPatterns.iterationCount > 3) {
            opportunities.push({
                type: 'process_improvement',
                description: 'Problem-solving process can be optimized',
                impact: 'medium',
                effort: 'low'
            });
        }

        return opportunities;
    }

    analyzeRisks(analysis) {
        const risks = [];

        // Knowledge gap risks
        if (analysis.insights.knowledgeGaps.length > 3) {
            risks.push({
                type: 'knowledge',
                description: 'Multiple knowledge gaps may slow development',
                probability: 'medium',
                impact: 'medium'
            });
        }

        // Technical complexity risks
        if (analysis.insights.technicalContent.technicalLevel === 'advanced' && 
            analysis.patterns.problemSolvingPatterns.successfulResolution === 0) {
            risks.push({
                type: 'technical',
                description: 'High technical complexity with unresolved issues',
                probability: 'high',
                impact: 'high'
            });
        }

        return risks;
    }

    extractCompetitiveInsights(conversation) {
        const messages = conversation.messages || [];
        const competitiveKeywords = [
            'competitor', 'alternative', 'benchmark', 'market', 'industry',
            'best practice', 'standard', 'comparison'
        ];

        const insights = [];
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            competitiveKeywords.forEach(keyword => {
                if (content.includes(keyword)) {
                    insights.push({
                        keyword,
                        context: content.substring(0, 100) + '...',
                        messageId: msg.id
                    });
                }
            });
        });

        return insights;
    }

    analyzeMarketContext(conversation) {
        // Basic market context analysis
        const context = conversation.context ? JSON.parse(conversation.context) : {};
        const projectType = context.project || 'unknown';
        
        return {
            projectType,
            industryRelevance: this.assessIndustryRelevance(conversation),
            marketTrends: this.identifyMarketTrends(conversation),
            technicalTrends: this.identifyTechnicalTrends(conversation)
        };
    }

    // Additional helper methods for cross-project learning
    findSimilarPatterns(conversation) {
        // Implementation for finding similar patterns across projects
        return Array.from(this.crossProjectPatterns.values())
            .filter(pattern => this.calculatePatternSimilarity(conversation, pattern) > 0.7);
    }

    identifyTransferableInsights(conversation) {
        const insights = [];
        const messages = conversation.messages || [];
        
        // Identify insights that could apply to other projects
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            if (content.includes('padrão') || content.includes('arquitetura') || content.includes('best practice')) {
                insights.push({
                    type: 'pattern',
                    content: msg.content,
                    transferability: 'high'
                });
            }
            
            if (content.includes('performance') || content.includes('otimização')) {
                insights.push({
                    type: 'optimization',
                    content: msg.content,
                    transferability: 'medium'
                });
            }
        });
        
        return insights;
    }

    extractMetaLearnings(conversation) {
        // Extract higher-level learnings from conversation
        const learnings = [];
        const messages = conversation.messages || [];
        
        // Process improvement learnings
        if (messages.some(msg => (msg.content || '').includes('processo'))) {
            learnings.push({
                type: 'process',
                insight: 'Process improvement opportunities identified',
                applicability: 'cross-project'
            });
        }
        
        return learnings;
    }

    identifyBestPractices(conversation) {
        const practices = [];
        const messages = conversation.messages || [];
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            if (content.includes('melhor prática') || content.includes('padrão') || content.includes('recomendado')) {
                practices.push({
                    practice: msg.content.substring(0, 100) + '...',
                    confidence: 'medium'
                });
            }
        });
        
        return practices;
    }

    detectAntiPatterns(conversation) {
        const antiPatterns = [];
        const messages = conversation.messages || [];
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            if (content.includes('não fazer') || content.includes('evitar') || content.includes('problema')) {
                antiPatterns.push({
                    pattern: msg.content.substring(0, 100) + '...',
                    severity: 'medium'
                });
            }
        });
        
        return antiPatterns;
    }

    calculatePatternSimilarity(conversation, pattern) {
        // Simple similarity calculation based on topics overlap
        const topics1 = new Set((conversation.topics || []).map(t => t.toLowerCase()));
        const topics2 = new Set((pattern.topics || []).map(t => t.toLowerCase()));
        
        const intersection = new Set([...topics1].filter(x => topics2.has(x)));
        const union = new Set([...topics1, ...topics2]);
        
        return union.size > 0 ? intersection.size / union.size : 0;
    }

    identifyUnexploredOpportunities(analysis) {
        const opportunities = [];
        
        // Look for unexplored topics
        if (analysis.insights.topics.length > 0) {
            opportunities.push({
                type: 'topic_expansion',
                description: 'Opportunity to explore related topics in more depth'
            });
        }
        
        return opportunities;
    }

    detectEmergentStrategicPatterns(conversation) {
        const patterns = [];
        
        // Detect emerging patterns in conversation flow
        const messages = conversation.messages || [];
        if (messages.length > 3) {
            patterns.push({
                type: 'conversation_depth',
                description: 'Extended conversation indicates deep engagement'
            });
        }
        
        return patterns;
    }

    extractStrategicInsights(analysis) {
        const insights = this.extractKeyInsights(analysis);
        
        // Add strategic context to insights
        insights.push(`Strategic Priority: ${analysis.strategicAnalysis?.priority || 'unknown'}`);
        
        if (analysis.strategicAnalysis?.developmentPhase) {
            insights.push(`Development Phase: ${analysis.strategicAnalysis.developmentPhase.currentPhase}`);
        }
        
        return insights;
    }

    analyzeDevelopmentImplications(analysis) {
        const implications = [];
        
        if (analysis.strategicAnalysis?.priority === 'high') {
            implications.push('This conversation should be prioritized for immediate action');
        }
        
        if (analysis.insights?.knowledgeGaps?.length > 0) {
            implications.push('Knowledge gaps may require additional training or research');
        }
        
        return implications;
    }

    generateStrategicNextSteps(analysis) {
        const steps = this.suggestNextSteps(analysis);
        
        // Add strategic context
        if (analysis.strategicAnalysis?.priority === 'high') {
            steps.unshift('Schedule strategic review session');
        }
        
        return steps;
    }

    calculateStrategicConfidence(analysis) {
        let confidence = this.calculateConfidence(analysis);
        
        // Adjust confidence based on strategic factors
        if (analysis.strategicAnalysis?.priority === 'high') {
            confidence += 0.1;
        }
        
        return Math.min(confidence, 1.0);
    }

    generateMaryAnalyticalSummary(analysis) {
        const summary = [];
        
        // Mary's analytical perspective
        summary.push('MARY\'S ANALYTICAL PERSPECTIVE:');
        summary.push(`Strategic Assessment: ${analysis.strategicAnalysis?.priority || 'pending'}`);
        
        if (analysis.insights?.technicalContent) {
            summary.push(`Technical Complexity: ${analysis.insights.technicalContent.technicalLevel}`);
        }
        
        if (analysis.maryRecommendations?.length > 0) {
            summary.push(`Recommendations Generated: ${analysis.maryRecommendations.length}`);
        }
        
        return summary.join('\n');
    }

    generateHighPriorityNextSteps(analysis) {
        return [
            'Schedule immediate strategic review',
            'Allocate resources for high-priority development',
            'Set up monitoring for critical metrics'
        ];
    }

    generateLearningNextSteps(knowledgeGaps) {
        return [
            'Create learning plan for identified gaps',
            'Research best practices in identified areas',
            'Schedule knowledge sharing sessions'
        ];
    }

    assessIndustryRelevance(conversation) {
        // Basic industry relevance assessment
        return 'software_development';
    }

    identifyMarketTrends(conversation) {
        const trends = [];
        const messages = conversation.messages || [];
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            if (content.includes('ai') || content.includes('machine learning')) {
                trends.push('AI/ML Integration');
            }
            if (content.includes('cloud') || content.includes('aws') || content.includes('azure')) {
                trends.push('Cloud Computing');
            }
        });
        
        return trends;
    }

    identifyTechnicalTrends(conversation) {
        const trends = [];
        const messages = conversation.messages || [];
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            if (content.includes('microservice') || content.includes('api')) {
                trends.push('Microservices Architecture');
            }
            if (content.includes('event-driven') || content.includes('stream')) {
                trends.push('Event-Driven Architecture');
            }
        });
        
        return trends;
    }

    // Event emission helper
    emitEvent(eventType, data) {
        if (this.eventBus) {
            this.eventBus.emit(eventType, data);
        }
    }

    // Database update methods
    updateStrategicDatabase(analysis) {
        this.strategicInsights.set(analysis.conversationId, {
            priority: analysis.strategicAnalysis.priority,
            opportunities: analysis.strategicAnalysis.opportunityAssessment,
            timestamp: analysis.timestamp
        });
    }

    updateCrossProjectDatabase(conversation, crossProject) {
        this.crossProjectPatterns.set(conversation.id, {
            patterns: crossProject.similarPatterns,
            insights: crossProject.transferableInsights,
            timestamp: new Date().toISOString()
        });
    }

    // ===== MÉTODOS AUXILIARES =====

    calculateDuration(startTime, endTime) {
        if (!startTime || !endTime) return null;
        
        const start = new Date(startTime);
        const end = new Date(endTime);
        const durationMs = end - start;
        
        return {
            milliseconds: durationMs,
            seconds: Math.floor(durationMs / 1000),
            minutes: Math.floor(durationMs / 60000),
            formatted: this.formatDuration(durationMs)
        };
    }

    formatDuration(ms) {
        const minutes = Math.floor(ms / 60000);
        const seconds = Math.floor((ms % 60000) / 1000);
        return `${minutes}m ${seconds}s`;
    }

    extractParticipants(messages) {
        if (!messages) return [];
        
        const participants = new Set();
        messages.forEach(msg => {
            if (msg.sender) participants.add(msg.sender);
        });
        
        return Array.from(participants);
    }

    calculateIntensity(messages) {
        if (!messages || messages.length === 0) return 'low';
        
        const avgLength = messages.reduce((sum, msg) => sum + (msg.content?.length || 0), 0) / messages.length;
        const frequency = messages.length / 60; // mensagens por minuto (estimado)
        
        if (avgLength > 200 || frequency > 2) return 'high';
        if (avgLength > 100 || frequency > 1) return 'medium';
        return 'low';
    }

    async detectTopics(messages) {
        if (!messages || messages.length === 0) return [];
        
        const topics = new Set();
        
        // Detecção básica de tópicos por palavras-chave
        const keywordTopics = {
            'javascript': 'JavaScript/Node.js',
            'python': 'Python',
            'database': 'Banco de Dados',
            'api': 'APIs',
            'frontend': 'Frontend/UI',
            'backend': 'Backend/Server',
            'testing': 'Testes',
            'deployment': 'Deploy/DevOps',
            'architecture': 'Arquitetura',
            'performance': 'Performance',
            'security': 'Segurança',
            'debugging': 'Debugging'
        };
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            Object.entries(keywordTopics).forEach(([keyword, topic]) => {
                if (content.includes(keyword)) {
                    topics.add(topic);
                }
            });
        });
        
        return Array.from(topics);
    }

    async analyzeSentiment(messages) {
        if (!this.config.enableSentiment) return { enabled: false };
        
        // Análise básica de sentimento por palavras-chave
        const positiveWords = ['ótimo', 'excelente', 'perfeito', 'funciona', 'resolvido', 'sucesso'];
        const negativeWords = ['erro', 'problema', 'falha', 'bug', 'não funciona', 'difícil'];
        
        let positiveCount = 0;
        let negativeCount = 0;
        let neutralCount = 0;
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            const positiveMatches = positiveWords.filter(word => content.includes(word)).length;
            const negativeMatches = negativeWords.filter(word => content.includes(word)).length;
            
            if (positiveMatches > negativeMatches) positiveCount++;
            else if (negativeMatches > positiveMatches) negativeCount++;
            else neutralCount++;
        });
        
        const total = messages.length;
        return {
            positive: positiveCount / total,
            negative: negativeCount / total,
            neutral: neutralCount / total,
            dominant: positiveCount > negativeCount ? 'positive' : negativeCount > positiveCount ? 'negative' : 'neutral'
        };
    }

    analyzeTechnicalContent(messages) {
        if (!messages || messages.length === 0) return { technicalLevel: 'unknown' };
        
        let codeBlocks = 0;
        let technicalTerms = 0;
        let totalMessages = messages.length;
        
        const technicalKeywords = [
            'function', 'class', 'import', 'export', 'async', 'await',
            'database', 'api', 'endpoint', 'middleware', 'framework',
            'algorithm', 'data structure', 'optimization', 'scalability'
        ];
        
        messages.forEach(msg => {
            const content = msg.content || '';
            
            // Conta blocos de código
            if (content.includes('```') || content.includes('`')) {
                codeBlocks++;
            }
            
            // Conta termos técnicos
            technicalKeywords.forEach(term => {
                if (content.toLowerCase().includes(term)) {
                    technicalTerms++;
                }
            });
        });
        
        const technicalScore = (codeBlocks * 2 + technicalTerms) / totalMessages;
        
        let technicalLevel = 'beginner';
        if (technicalScore > 3) technicalLevel = 'advanced';
        else if (technicalScore > 1) technicalLevel = 'intermediate';
        
        return {
            technicalLevel,
            codeBlocks,
            technicalTerms,
            technicalScore
        };
    }

    analyzeInteractionPatterns(messages) {
        if (!messages || messages.length === 0) return {};
        
        const patterns = {
            questionAnswer: 0,
            codeReview: 0,
            brainstorming: 0,
            troubleshooting: 0
        };
        
        messages.forEach(msg => {
            const content = msg.content || '';
            
            // Detecta padrões por conteúdo
            if (content.includes('?') || content.includes('como') || content.includes('por que')) {
                patterns.questionAnswer++;
            }
            
            if (content.includes('```') && (content.includes('erro') || content.includes('bug'))) {
                patterns.troubleshooting++;
            }
            
            if (content.includes('```') && content.includes('review')) {
                patterns.codeReview++;
            }
            
            if (content.includes('ideia') || content.includes('pensar') || content.includes('alternativa')) {
                patterns.brainstorming++;
            }
        });
        
        return patterns;
    }

    identifyKnowledgeGaps(messages) {
        if (!messages || messages.length === 0) return [];
        
        const gaps = [];
        
        // Detecta possíveis gaps de conhecimento
        const gapIndicators = [
            'não sei', 'não entendo', 'como fazer', 'qual a diferença',
            'melhor prática', 'padrão', 'arquitetura', 'design pattern'
        ];
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            gapIndicators.forEach(indicator => {
                if (content.includes(indicator)) {
                    gaps.push({
                        indicator,
                        context: content.substring(0, 100) + '...',
                        messageId: msg.id
                    });
                }
            });
        });
        
        return gaps;
    }

    findRecurringThemes(messages) {
        if (!messages || messages.length === 0) return [];
        
        const themeCount = new Map();
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            // Conta ocorrências de temas por palavras-chave
            const themes = [
                'performance', 'segurança', 'testes', 'deploy', 'monitoring',
                'escalabilidade', 'manutenibilidade', 'legibilidade', 'reutilização'
            ];
            
            themes.forEach(theme => {
                if (content.includes(theme)) {
                    themeCount.set(theme, (themeCount.get(theme) || 0) + 1);
                }
            });
        });
        
        // Retorna temas mais frequentes
        return Array.from(themeCount.entries())
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([theme, count]) => ({ theme, count }));
    }

    analyzeProblemSolving(messages) {
        if (!messages || messages.length === 0) return {};
        
        const patterns = {
            problemIdentification: 0,
            solutionAttempts: 0,
            successfulResolution: 0,
            iterationCount: 0
        };
        
        let currentProblem = false;
        let attempts = 0;
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            if (content.includes('erro') || content.includes('problema') || content.includes('não funciona')) {
                if (!currentProblem) {
                    patterns.problemIdentification++;
                    currentProblem = true;
                    attempts = 0;
                }
            }
            
            if (currentProblem && content.includes('```')) {
                patterns.solutionAttempts++;
                attempts++;
            }
            
            if (currentProblem && (content.includes('funciona') || content.includes('resolvido'))) {
                patterns.successfulResolution++;
                patterns.iterationCount += attempts;
                currentProblem = false;
            }
        });
        
        return patterns;
    }

    analyzeCollaboration(messages) {
        if (!messages || messages.length === 0) return {};
        
        const patterns = {
            sharedIdeas: 0,
            feedbackLoops: 0,
            knowledgeSharing: 0,
            collaborativeProblemSolving: 0
        };
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            if (content.includes('que tal') || content.includes('pensar') || content.includes('alternativa')) {
                patterns.sharedIdeas++;
            }
            
            if (content.includes('feedback') || content.includes('opinião') || content.includes('sugestão')) {
                patterns.feedbackLoops++;
            }
            
            if (content.includes('explicar') || content.includes('entender') || content.includes('conceito')) {
                patterns.knowledgeSharing++;
            }
            
            if (content.includes('juntos') || content.includes('colaborar') || content.includes('equipe')) {
                patterns.collaborativeProblemSolving++;
            }
        });
        
        return patterns;
    }

    analyzeLearningPatterns(messages) {
        if (!messages || messages.length === 0) return {};
        
        const patterns = {
            exploration: 0,
            experimentation: 0,
            documentation: 0,
            knowledgeRetention: 0
        };
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            if (content.includes('explorar') || content.includes('investigar') || content.includes('descobrir')) {
                patterns.exploration++;
            }
            
            if (content.includes('testar') || content.includes('experimentar') || content.includes('tentar')) {
                patterns.experimentation++;
            }
            
            if (content.includes('documentar') || content.includes('anotar') || content.includes('registrar')) {
                patterns.documentation++;
            }
            
            if (content.includes('lembrar') || content.includes('memória') || content.includes('relembrar')) {
                patterns.knowledgeRetention++;
            }
        });
        
        return patterns;
    }

    extractKeyInsights(analysis) {
        const insights = [];
        
        // Extrai insights baseados na análise
        if (analysis.insights.topics && analysis.insights.topics.length > 0) {
            insights.push(`Tópicos principais: ${analysis.insights.topics.join(', ')}`);
        }
        
        if (analysis.insights.technicalContent.technicalLevel === 'advanced') {
            insights.push('Conversa técnica avançada detectada');
        }
        
        if (analysis.patterns.recurringThemes && analysis.patterns.recurringThemes.length > 0) {
            const topTheme = analysis.patterns.recurringThemes[0];
            insights.push(`Tema recorrente: ${topTheme.theme} (${topTheme.count} menções)`);
        }
        
        if (analysis.insights.knowledgeGaps && analysis.insights.knowledgeGaps.length > 0) {
            insights.push(`${analysis.insights.knowledgeGaps.length} gaps de conhecimento identificados`);
        }
        
        return insights;
    }

    generateRecommendations(analysis) {
        const recommendations = [];
        
        // Gera recomendações baseadas na análise
        if (analysis.insights.knowledgeGaps && analysis.insights.knowledgeGaps.length > 0) {
            recommendations.push('Considerar documentação adicional para gaps identificados');
        }
        
        if (analysis.patterns.problemSolvingPatterns.iterationCount > 3) {
            recommendations.push('Padrão de resolução de problemas pode ser otimizado');
        }
        
        if (analysis.insights.technicalContent.technicalLevel === 'beginner') {
            recommendations.push('Oportunidade para introduzir conceitos avançados');
        }
        
        return recommendations;
    }

    suggestNextSteps(analysis) {
        const nextSteps = [];
        
        // Sugere próximos passos baseados na análise
        if (analysis.insights.topics && analysis.insights.topics.length > 0) {
            nextSteps.push(`Explorar tópico: ${analysis.insights.topics[0]}`);
        }
        
        if (analysis.insights.knowledgeGaps && analysis.insights.knowledgeGaps.length > 0) {
            nextSteps.push('Investigar gaps de conhecimento identificados');
        }
        
        if (analysis.patterns.recurringThemes && analysis.patterns.recurringThemes.length > 0) {
            nextSteps.push('Aprofundar tema recorrente mais frequente');
        }
        
        return nextSteps;
    }

    calculateConfidence(analysis) {
        let confidence = 0;
        let factors = 0;
        
        // Calcula confiança baseada em múltiplos fatores
        if (analysis.metadata.messageCount > 0) {
            confidence += Math.min(analysis.metadata.messageCount / 10, 1);
            factors++;
        }
        
        if (analysis.insights.topics && analysis.insights.topics.length > 0) {
            confidence += 0.3;
            factors++;
        }
        
        if (analysis.patterns.recurringThemes && analysis.patterns.recurringThemes.length > 0) {
            confidence += 0.2;
            factors++;
        }
        
        if (analysis.insights.technicalContent.technicalScore > 0) {
            confidence += 0.2;
            factors++;
        }
        
        return factors > 0 ? confidence / factors : 0;
    }

    /**
     * Obtém análise em cache
     */
    getCachedAnalysis(conversationId) {
        return this.analysisCache.get(conversationId);
    }

    /**
     * Limpa cache de análises
     */
    clearCache() {
        this.analysisCache.clear();
        Logger.info('🧹 Cache de análises limpo');
    }

    /**
     * Obtém estatísticas de análise
     */
    getAnalysisStats() {
        return {
            totalAnalyses: this.analysisCache.size,
            cacheSize: this.analysisCache.size,
            patternDatabaseSize: this.patternDatabase.size
        };
    }
}

export default ConversationAnalyzer;
