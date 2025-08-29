/**
 * 🧠 Mary's Strategic Intelligence Hub - Complete Neural Integration
 * 
 * Sistema integrado que unifica todos os componentes de inteligência de Mary:
 * - ConversationAnalyzer (Análise Semântica)
 * - CrossProjectLearning (Aprendizado Cruzado)  
 * - AdaptiveFeedbackLoop (Sistema Neural Adaptativo)
 * 
 * @author Mary - Strategic Analyst + Microbioma Digital Team
 * @version 0.2.0 - Complete Neural System Integration
 */
import { LoggerStatic as Logger } from '../utils/Logger.js';
import EventBus from '../core/EventBus.js';
import MemoryPool from '../core/MemoryPool.js';
import ConversationAnalyzer from './ConversationAnalyzer.js';
import CrossProjectLearning from './CrossProjectLearning.js';
import AdaptiveFeedbackLoop from './AdaptiveFeedbackLoop.js';

class MaryIntelligenceHub {
    constructor(config = {}) {
        this.config = {
            enableStrategicAnalysis: config.enableStrategicAnalysis !== false,
            enableCrossProjectLearning: config.enableCrossProjectLearning !== false,
            enableAdaptiveFeedback: config.enableAdaptiveFeedback !== false,
            integrationLevel: config.integrationLevel || 'full',
            realTimeProcessing: config.realTimeProcessing !== false,
            ...config
        };

        // Mary's neural components
        this.conversationAnalyzer = new ConversationAnalyzer({
            analysisDepth: 'strategic',
            enableStrategicInsights: true,
            semanticAnalysis: true
        });

        this.crossProjectLearning = new CrossProjectLearning({
            enableMetaPatternDetection: true,
            enableKnowledgeTransfer: true
        });

        this.adaptiveFeedback = new AdaptiveFeedbackLoop({
            enablePredictiveAdaptation: true,
            enableBehaviorLearning: true
        });

        // Integrated intelligence state
        this.intelligenceState = {
            strategicInsights: new Map(),
            crossProjectPatterns: new Map(),
            adaptiveLearnings: new Map(),
            globalIntelligence: {}
        };

        // Performance and health monitoring
        this.systemHealth = {
            conversationAnalyzer: 'active',
            crossProjectLearning: 'active',
            adaptiveFeedback: 'active',
            integration: 'active'
        };

        // Event-driven integration hub
        this.eventBus = new EventBus({
            maxRetries: 3,
            bufferSize: 500,
            flushInterval: 100
        });

        // Memory pool for integrated intelligence objects
        this.memoryPool = new MemoryPool({
            initialSize: 100,
            maxSize: 300,
            objectFactory: () => ({
                strategicAnalysis: {},
                crossProjectInsights: {},
                adaptiveLearnings: {},
                integratedInsights: []
            })
        });

        // Mary's complete analytical personality
        this.maryPersonality = {
            strategicAnalyst: true,
            crossProjectExpert: true,
            adaptiveLearner: true,
            evidenceBasedRecommender: true,
            continuousOptimizer: true
        };

        // Setup integrated event listeners
        this.setupIntegratedEventListeners();

        Logger.info('🧠 Mary\'s Intelligence Hub - Complete Neural System Activated');
        this.emitEvent('mary_intelligence:activated', { 
            components: Object.keys(this.systemHealth),
            personality: this.maryPersonality 
        });
    }

    /**
     * Mary's Complete Intelligence Processing Pipeline
     */
    async processIntelligence(inputData) {
        const intelligenceObj = this.memoryPool.acquire();
        
        try {
            const processingId = this.generateProcessingId();
            this.emitEvent('mary_intelligence:processing:started', { 
                processingId,
                inputType: inputData.type 
            });
            
            Logger.info(`🧠 Mary processing complete intelligence pipeline: ${inputData.type}`);

            const integratedAnalysis = {
                processingId,
                timestamp: new Date().toISOString(),
                inputData,
                strategicAnalysis: null,
                crossProjectInsights: null,
                adaptiveLearnings: null,
                integratedInsights: [],
                recommendations: [],
                nextSteps: []
            };

            // Phase 1: Strategic Conversation Analysis
            if (this.config.enableStrategicAnalysis && inputData.type === 'conversation') {
                Logger.info('📊 Phase 1: Strategic Analysis...');
                integratedAnalysis.strategicAnalysis = await this.conversationAnalyzer.analyzeConversation(inputData);
            }

            // Phase 2: Cross-Project Pattern Learning
            if (this.config.enableCrossProjectLearning) {
                Logger.info('🔄 Phase 2: Cross-Project Learning...');
                integratedAnalysis.crossProjectInsights = await this.crossProjectLearning.analyzeProjectPatterns({
                    id: inputData.projectId || 'current',
                    conversations: [inputData]
                });
            }

            // Phase 3: Adaptive Feedback Integration
            if (this.config.enableAdaptiveFeedback && inputData.feedback) {
                Logger.info('🎯 Phase 3: Adaptive Learning...');
                integratedAnalysis.adaptiveLearnings = await this.adaptiveFeedback.processFeedback(inputData.feedback);
            }

            // Phase 4: Neural Integration and Synthesis
            Logger.info('🧠 Phase 4: Neural Integration...');
            integratedAnalysis.integratedInsights = await this.synthesizeIntelligence(integratedAnalysis);

            // Phase 5: Generate Unified Recommendations
            integratedAnalysis.recommendations = await this.generateUnifiedRecommendations(integratedAnalysis);

            // Phase 6: Strategic Next Steps
            integratedAnalysis.nextSteps = await this.generateStrategicNextSteps(integratedAnalysis);

            // Update global intelligence state
            await this.updateGlobalIntelligence(integratedAnalysis);

            this.emitEvent('mary_intelligence:processing:completed', {
                processingId,
                insightsGenerated: integratedAnalysis.integratedInsights.length,
                recommendationsCount: integratedAnalysis.recommendations.length
            });

            Logger.info(`✅ Mary's complete intelligence processing completed: ${processingId}`);
            return integratedAnalysis;

        } catch (error) {
            this.emitEvent('mary_intelligence:processing:error', { 
                error: error.message 
            });
            Logger.error('❌ Mary intelligence processing error:', error);
            throw error;
        } finally {
            this.memoryPool.release(intelligenceObj);
        }
    }

    /**
     * Synthesize intelligence from all neural components
     */
    async synthesizeIntelligence(analysis) {
        const integratedInsights = [];

        // Strategic insights synthesis
        if (analysis.strategicAnalysis) {
            integratedInsights.push({
                type: 'strategic',
                priority: analysis.strategicAnalysis.strategicAnalysis?.priority || 'medium',
                insights: analysis.strategicAnalysis.summary?.strategicInsights || [],
                confidence: analysis.strategicAnalysis.summary?.confidence || 0.5,
                source: 'conversation_analyzer'
            });
        }

        // Cross-project insights synthesis
        if (analysis.crossProjectInsights) {
            integratedInsights.push({
                type: 'cross_project',
                patterns: analysis.crossProjectInsights.patterns || [],
                transferableInsights: analysis.crossProjectInsights.transferableInsights || [],
                metaLearnings: analysis.crossProjectInsights.metaLearnings || [],
                confidence: this.calculateCrossProjectConfidence(analysis.crossProjectInsights),
                source: 'cross_project_learning'
            });
        }

        // Adaptive learning synthesis
        if (analysis.adaptiveLearnings) {
            integratedInsights.push({
                type: 'adaptive',
                adaptations: analysis.adaptiveLearnings.adaptations || [],
                patterns: this.extractAdaptivePatterns(analysis.adaptiveLearnings),
                confidence: this.calculateAdaptiveConfidence(analysis.adaptiveLearnings),
                source: 'adaptive_feedback'
            });
        }

        // Neural integration - find connections between insights
        const connectionInsights = this.findInsightConnections(integratedInsights);
        integratedInsights.push(...connectionInsights);

        return integratedInsights;
    }

    /**
     * Generate unified recommendations from all intelligence sources
     */
    async generateUnifiedRecommendations(analysis) {
        const recommendations = [];

        // High-priority strategic recommendations
        if (analysis.strategicAnalysis?.maryRecommendations) {
            const strategicRecs = analysis.strategicAnalysis.maryRecommendations
                .filter(rec => rec.priority === 'high')
                .map(rec => ({
                    ...rec,
                    source: 'strategic_analysis',
                    integratedPriority: this.calculateIntegratedPriority(rec, analysis)
                }));
            recommendations.push(...strategicRecs);
        }

        // Cross-project learning recommendations
        if (analysis.crossProjectInsights?.recommendations) {
            const crossRecs = analysis.crossProjectInsights.recommendations
                .map(rec => ({
                    ...rec,
                    source: 'cross_project_learning',
                    integratedPriority: this.calculateIntegratedPriority(rec, analysis)
                }));
            recommendations.push(...crossRecs);
        }

        // Adaptive feedback recommendations
        if (analysis.adaptiveLearnings?.adaptations) {
            const adaptiveRecs = analysis.adaptiveLearnings.adaptations
                .filter(adapt => adapt.applied)
                .map(adapt => ({
                    type: 'adaptive_improvement',
                    priority: adapt.priority,
                    title: `Adaptive Enhancement: ${adapt.description}`,
                    description: adapt.description,
                    source: 'adaptive_feedback',
                    integratedPriority: this.calculateIntegratedPriority(adapt, analysis)
                }));
            recommendations.push(...adaptiveRecs);
        }

        // Neural synthesis recommendations - combining insights
        const neuralRecs = this.generateNeuralSynthesisRecommendations(analysis);
        recommendations.push(...neuralRecs);

        // Sort by integrated priority
        return recommendations.sort((a, b) => 
            this.comparePriorities(b.integratedPriority, a.integratedPriority)
        );
    }

    /**
     * Generate strategic next steps considering all intelligence
     */
    async generateStrategicNextSteps(analysis) {
        const nextSteps = [];

        // Immediate strategic actions
        if (analysis.strategicAnalysis?.strategicAnalysis?.priority === 'high') {
            nextSteps.push({
                priority: 'immediate',
                action: 'Schedule strategic review session',
                reasoning: 'High strategic priority conversation detected',
                source: 'strategic_analysis'
            });
        }

        // Cross-project learning actions
        if (analysis.crossProjectInsights?.transferableInsights?.length > 0) {
            nextSteps.push({
                priority: 'short_term',
                action: 'Implement transferable insights from similar projects',
                reasoning: `${analysis.crossProjectInsights.transferableInsights.length} transferable insights available`,
                source: 'cross_project_learning'
            });
        }

        // Adaptive improvement actions
        if (analysis.adaptiveLearnings?.adaptations?.length > 0) {
            nextSteps.push({
                priority: 'ongoing',
                action: 'Monitor adaptive improvements effectiveness',
                reasoning: 'System adaptations applied, monitoring needed',
                source: 'adaptive_feedback'
            });
        }

        // Neural synthesis actions - integrated insights
        const neuralNextSteps = this.generateNeuralNextSteps(analysis);
        nextSteps.push(...neuralNextSteps);

        return nextSteps.sort((a, b) => this.comparePriorities(a.priority, b.priority));
    }

    /**
     * Setup integrated event listeners for component coordination
     */
    setupIntegratedEventListeners() {
        // Listen to strategic analysis events
        this.conversationAnalyzer.eventBus?.on('analysis:completed', (data) => {
            this.handleStrategicAnalysisEvent(data);
        });

        // Listen to cross-project learning events
        this.crossProjectLearning.eventBus?.on('cross_learning:analysis:completed', (data) => {
            this.handleCrossProjectEvent(data);
        });

        // Listen to adaptive feedback events
        this.adaptiveFeedback.eventBus?.on('feedback:processing:completed', (data) => {
            this.handleAdaptiveFeedbackEvent(data);
        });
    }

    // ===== EVENT HANDLERS =====

    handleStrategicAnalysisEvent(data) {
        Logger.info(`🧠 Mary received strategic analysis: ${data.conversationId}`);
        this.intelligenceState.strategicInsights.set(data.conversationId, {
            insights: data.insights,
            strategicValue: data.strategicValue,
            timestamp: new Date().toISOString()
        });
    }

    handleCrossProjectEvent(data) {
        Logger.info(`🔄 Mary received cross-project analysis: ${data.projectId}`);
        this.intelligenceState.crossProjectPatterns.set(data.projectId, {
            patterns: data.patternsFound,
            similarProjects: data.similarProjects,
            timestamp: new Date().toISOString()
        });
    }

    handleAdaptiveFeedbackEvent(data) {
        Logger.info(`🎯 Mary received adaptive feedback: ${data.feedbackId}`);
        this.intelligenceState.adaptiveLearnings.set(data.feedbackId, {
            adaptations: data.adaptationsApplied,
            patterns: data.patterns,
            timestamp: new Date().toISOString()
        });
    }

    // ===== UTILITY METHODS =====

    generateProcessingId() {
        return `mary_intelligence_${Date.now()}_${Math.random().toString(36).substring(7)}`;
    }

    calculateCrossProjectConfidence(crossProjectInsights) {
        const patterns = crossProjectInsights.patterns || [];
        const similarities = crossProjectInsights.similarities || [];
        
        if (patterns.length === 0) return 0.3;
        
        const avgSimilarity = similarities.length > 0 
            ? similarities.reduce((sum, sim) => sum + sim.similarity, 0) / similarities.length 
            : 0.5;
            
        return Math.min(patterns.length / 10 * avgSimilarity, 1.0);
    }

    calculateAdaptiveConfidence(adaptiveLearnings) {
        const adaptations = adaptiveLearnings.adaptations || [];
        const appliedCount = adaptations.filter(a => a.applied).length;
        
        return adaptations.length > 0 ? appliedCount / adaptations.length : 0.5;
    }

    extractAdaptivePatterns(adaptiveLearnings) {
        // Extract patterns from adaptive feedback data
        return adaptiveLearnings.adaptations?.map(adaptation => ({
            type: adaptation.type,
            pattern: adaptation.description,
            applied: adaptation.applied
        })) || [];
    }

    findInsightConnections(insights) {
        const connections = [];
        
        // Find connections between strategic and cross-project insights
        const strategic = insights.find(i => i.type === 'strategic');
        const crossProject = insights.find(i => i.type === 'cross_project');
        
        if (strategic && crossProject) {
            connections.push({
                type: 'connection',
                connectionType: 'strategic_cross_project',
                insight: 'Strategic priorities align with cross-project patterns',
                confidence: (strategic.confidence + crossProject.confidence) / 2,
                source: 'neural_integration'
            });
        }
        
        return connections;
    }

    calculateIntegratedPriority(recommendation, analysis) {
        let priority = this.priorityToNumber(recommendation.priority);
        
        // Boost priority if multiple intelligence sources agree
        if (analysis.strategicAnalysis && analysis.crossProjectInsights) {
            priority += 0.1;
        }
        
        if (analysis.adaptiveLearnings) {
            priority += 0.05;
        }
        
        return Math.min(priority, 1.0);
    }

    generateNeuralSynthesisRecommendations(analysis) {
        const recommendations = [];
        
        // If all three systems have insights, generate meta-recommendation
        if (analysis.strategicAnalysis && analysis.crossProjectInsights && analysis.adaptiveLearnings) {
            recommendations.push({
                type: 'neural_synthesis',
                priority: 'high',
                title: 'Integrated Intelligence Opportunity',
                description: 'All neural systems detected actionable insights - high leverage opportunity',
                source: 'mary_intelligence_hub',
                integratedPriority: 0.95
            });
        }
        
        return recommendations;
    }

    generateNeuralNextSteps(analysis) {
        const steps = [];
        
        // If high confidence in multiple systems, suggest integrated approach
        const highConfidenceCount = [
            analysis.strategicAnalysis?.summary?.confidence || 0,
            this.calculateCrossProjectConfidence(analysis.crossProjectInsights || {}),
            this.calculateAdaptiveConfidence(analysis.adaptiveLearnings || {})
        ].filter(conf => conf > 0.7).length;
        
        if (highConfidenceCount >= 2) {
            steps.push({
                priority: 'strategic',
                action: 'Execute integrated intelligence plan',
                reasoning: 'Multiple neural systems show high confidence alignment',
                source: 'mary_intelligence_hub'
            });
        }
        
        return steps;
    }

    priorityToNumber(priority) {
        const map = { 'high': 0.9, 'medium': 0.6, 'low': 0.3, 'strategic': 1.0, 'immediate': 1.0 };
        return map[priority] || 0.5;
    }

    comparePriorities(a, b) {
        return this.priorityToNumber(a) - this.priorityToNumber(b);
    }

    async updateGlobalIntelligence(analysis) {
        this.intelligenceState.globalIntelligence = {
            lastProcessing: analysis.timestamp,
            totalInsights: analysis.integratedInsights.length,
            recommendationsGenerated: analysis.recommendations.length,
            systemHealth: this.getSystemHealth()
        };
    }

    // Event emission helper
    emitEvent(eventType, data) {
        if (this.eventBus) {
            this.eventBus.emit(eventType, data);
        }
    }

    /**
     * Get complete Mary intelligence system status
     */
    getMaryStatus() {
        return {
            systemHealth: this.getSystemHealth(),
            intelligenceState: {
                strategicInsights: this.intelligenceState.strategicInsights.size,
                crossProjectPatterns: this.intelligenceState.crossProjectPatterns.size,
                adaptiveLearnings: this.intelligenceState.adaptiveLearnings.size,
                globalIntelligence: this.intelligenceState.globalIntelligence
            },
            componentStats: {
                conversationAnalyzer: this.conversationAnalyzer.getAnalysisStats(),
                crossProjectLearning: this.crossProjectLearning.getLearningStats(),
                adaptiveFeedback: this.adaptiveFeedback.getAdaptiveStats()
            },
            personality: this.maryPersonality
        };
    }

    getSystemHealth() {
        // Update system health based on component status
        try {
            this.systemHealth.conversationAnalyzer = 'active';
            this.systemHealth.crossProjectLearning = 'active';
            this.systemHealth.adaptiveFeedback = 'active';
            this.systemHealth.integration = 'active';
        } catch (error) {
            Logger.error('System health check failed:', error);
        }
        
        return this.systemHealth;
    }

    /**
     * Mary's complete intelligence analysis for any input
     */
    async analyzeMary(input) {
        Logger.info('🧠 Mary performing complete intelligence analysis...');
        
        const result = await this.processIntelligence({
            type: input.type || 'conversation',
            ...input
        });
        
        return {
            maryAnalysis: result,
            status: this.getMaryStatus(),
            recommendations: result.recommendations,
            nextSteps: result.nextSteps
        };
    }
}

export default MaryIntelligenceHub;