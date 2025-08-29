#!/usr/bin/env node
/**
 * 🧠 Mary's Strategic Intelligence Test
 * 
 * Teste das capacidades analíticas estratégicas de Mary
 * Demonstração do ConversationAnalyzer v0.2.0
 */

import ConversationAnalyzer from '../src/metabolism/ConversationAnalyzer.js';
import DatabaseManagerOptimized from '../src/storage/DatabaseManagerOptimized.js';
import { LoggerStatic as Logger } from '../src/utils/Logger.js';

class MaryAnalyzerTest {
    constructor() {
        this.analyzer = new ConversationAnalyzer({
            analysisDepth: 'strategic',
            enableStrategicInsights: true,
            enableCrossProjectLearning: true,
            semanticAnalysis: true
        });
        
        this.dbManager = new DatabaseManagerOptimized({
            path: './data/local.db',
            walMode: true
        });
        
        Logger.info('🧠 Mary Analyzer Test Initialized');
    }

    async runTest() {
        Logger.info('🚀 Starting Mary\'s Strategic Analysis Test');
        
        try {
            // Load real conversations from database
            const conversations = await this.loadConversations();
            
            if (conversations.length === 0) {
                Logger.warn('⚠️  No conversations found. Creating sample data...');
                await this.createSampleConversation();
                return;
            }

            Logger.info(`📊 Found ${conversations.length} conversations to analyze`);
            
            // Analyze each conversation with Mary's strategic intelligence
            for (const conversation of conversations) {
                await this.analyzeWithMary(conversation);
            }

            // Generate strategic insights summary
            await this.generateStrategicSummary();
            
            Logger.info('✅ Mary\'s Strategic Analysis Test Completed');
            
        } catch (error) {
            Logger.error('❌ Test failed:', error);
        } finally {
            await this.dbManager.close();
        }
    }

    async loadConversations() {
        // Use direct SQL queries since we know the schema
        const db = this.dbManager.db;
        
        return new Promise((resolve, reject) => {
            db.all('SELECT * FROM conversations LIMIT 5', (err, conversations) => {
                if (err) {
                    reject(err);
                    return;
                }
                
                // Load messages for each conversation
                const promises = conversations.map(conversation => {
                    return new Promise((resolveMsg, rejectMsg) => {
                        db.all('SELECT * FROM messages WHERE conversation_id = ?', [conversation.id], (err, messages) => {
                            if (err) {
                                rejectMsg(err);
                                return;
                            }
                            conversation.messages = messages;
                            resolveMsg(conversation);
                        });
                    });
                });
                
                Promise.all(promises).then(resolve).catch(reject);
            });
        });
    }

    async analyzeWithMary(conversation) {
        Logger.info(`🔍 Mary analyzing: ${conversation.id}`);
        
        const analysis = await this.analyzer.analyzeConversation(conversation);
        
        // Display Mary's strategic insights
        this.displayStrategicAnalysis(analysis);
        
        return analysis;
    }

    displayStrategicAnalysis(analysis) {
        console.log('\n' + '='.repeat(80));
        console.log(`🧠 MARY'S STRATEGIC ANALYSIS - ${analysis.conversationId}`);
        console.log('='.repeat(80));
        
        // Basic Analysis
        console.log('\n📊 BASIC INSIGHTS:');
        console.log(`   Topics: ${analysis.insights.topics.join(', ')}`);
        console.log(`   Technical Level: ${analysis.insights.technicalContent.technicalLevel}`);
        console.log(`   Duration: ${analysis.metadata.duration?.formatted || 'N/A'}`);
        console.log(`   Messages: ${analysis.metadata.messageCount}`);
        
        // Strategic Analysis
        console.log('\n🎯 STRATEGIC ANALYSIS:');
        console.log(`   Priority: ${analysis.strategicAnalysis.priority.toUpperCase()}`);
        console.log(`   Development Phase: ${analysis.strategicAnalysis.developmentPhase.currentPhase}`);
        console.log(`   Opportunities: ${analysis.strategicAnalysis.opportunityAssessment.length}`);
        console.log(`   Risks: ${analysis.strategicAnalysis.riskAnalysis.length}`);
        
        // Mary's Recommendations
        console.log('\n💡 MARY\'S RECOMMENDATIONS:');
        analysis.maryRecommendations.forEach((rec, i) => {
            console.log(`   ${i + 1}. [${rec.priority.toUpperCase()}] ${rec.title}`);
            console.log(`      ${rec.description}`);
            if (rec.nextSteps && rec.nextSteps.length > 0) {
                console.log(`      Next: ${rec.nextSteps[0]}`);
            }
        });
        
        // Strategic Summary
        if (analysis.summary.maryAnalysis) {
            console.log('\n🧩 MARY\'S ANALYTICAL PERSPECTIVE:');
            console.log(`   Strategic Value: ${analysis.summary.strategicValue}`);
            console.log(`   Confidence: ${Math.round(analysis.summary.confidence * 100)}%`);
        }
        
        console.log('\n' + '='.repeat(80));
    }

    async generateStrategicSummary() {
        const stats = this.analyzer.getAnalysisStats();
        
        console.log('\n' + '🌟'.repeat(40));
        console.log('MARY\'S STRATEGIC INTELLIGENCE SUMMARY');
        console.log('🌟'.repeat(40));
        
        console.log(`\n📈 ANALYSIS STATISTICS:`);
        console.log(`   Total Analyses: ${stats.totalAnalyses}`);
        console.log(`   Cache Size: ${stats.cacheSize}`);
        console.log(`   Pattern Database: ${stats.patternDatabaseSize}`);
        
        // Strategic insights from all analyses
        const allAnalyses = Array.from(this.analyzer.analysisCache.values());
        
        if (allAnalyses.length > 0) {
            console.log(`\n🎯 STRATEGIC INSIGHTS:`);
            
            // Priority distribution
            const priorities = allAnalyses.reduce((acc, analysis) => {
                const priority = analysis.strategicAnalysis.priority;
                acc[priority] = (acc[priority] || 0) + 1;
                return acc;
            }, {});
            
            Object.entries(priorities).forEach(([priority, count]) => {
                console.log(`   ${priority.toUpperCase()}: ${count} conversations`);
            });
            
            // Most common topics
            const allTopics = allAnalyses.flatMap(a => a.insights.topics);
            const topicFreq = allTopics.reduce((acc, topic) => {
                acc[topic] = (acc[topic] || 0) + 1;
                return acc;
            }, {});
            
            console.log(`\n📚 TRENDING TOPICS:`);
            Object.entries(topicFreq)
                .sort(([,a], [,b]) => b - a)
                .slice(0, 5)
                .forEach(([topic, count]) => {
                    console.log(`   ${topic}: ${count} mentions`);
                });
                
            // Total recommendations
            const totalRecs = allAnalyses.reduce((sum, a) => sum + a.maryRecommendations.length, 0);
            console.log(`\n💡 TOTAL RECOMMENDATIONS: ${totalRecs}`);
        }
        
        console.log('\n🧠 Mary\'s analysis complete. Strategic intelligence active and learning.');
        console.log('🌟'.repeat(40));
    }

    async createSampleConversation() {
        Logger.info('🔧 Creating sample conversation for analysis...');
        
        const sampleConversation = {
            id: 'test_conv_' + Date.now(),
            start_time: new Date(Date.now() - 300000).toISOString(), // 5 minutes ago
            end_time: new Date().toISOString(),
            context: JSON.stringify({
                project: 'microbioma-digital',
                user: 'developer',
                environment: 'development'
            }),
            metadata: JSON.stringify({
                status: 'test',
                created: new Date().toISOString()
            }),
            messages: [
                {
                    id: 'msg_1',
                    sender: 'user',
                    content: 'Estou trabalhando na arquitetura do sistema de análise. Preciso implementar algoritmos de machine learning para detecção de padrões.',
                    timestamp: new Date(Date.now() - 240000).toISOString(),
                    message_type: 'question'
                },
                {
                    id: 'msg_2',
                    sender: 'assistant',
                    content: 'Excelente! Para detecção de padrões, sugiro implementar análise semântica com NLP. Podemos usar técnicas de clustering e análise de sentimento.',
                    timestamp: new Date(Date.now() - 180000).toISOString(),
                    message_type: 'response'
                },
                {
                    id: 'msg_3',
                    sender: 'user',
                    content: 'Como posso otimizar a performance? O sistema precisa processar milhares de conversas rapidamente.',
                    timestamp: new Date(Date.now() - 120000).toISOString(),
                    message_type: 'question'
                },
                {
                    id: 'msg_4',
                    sender: 'assistant',
                    content: 'Para performance, considere: 1) Event-driven architecture, 2) Stream processing, 3) Memory pooling, 4) Caching inteligente. Posso ajudar a implementar.',
                    timestamp: new Date(Date.now() - 60000).toISOString(),
                    message_type: 'response'
                }
            ]
        };

        Logger.info('🧠 Analyzing sample conversation with Mary\'s strategic intelligence...');
        await this.analyzeWithMary(sampleConversation);
    }
}

// Execute test if called directly
if (import.meta.url === `file://${process.argv[1]}`) {
    const test = new MaryAnalyzerTest();
    test.runTest().catch(console.error);
}

export default MaryAnalyzerTest;