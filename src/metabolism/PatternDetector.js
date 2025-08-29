/**
 * 🔍 PatternDetector - Detector de Padrões Avançados do Microbioma Digital
 * 
 * Sistema de detecção de padrões emergentes usando TF-IDF, clustering e análise temporal
 * 
 * @author Microbioma Digital Team
 * @version 0.1.0
 */
import { LoggerStatic as Logger } from '../utils/Logger.js';

class PatternDetector {
    constructor(config = {}) {
        this.config = {
            minPatternConfidence: config.minPatternConfidence || 0.7,
            maxTopicsPerConversation: config.maxTopicsPerConversation || 5,
            temporalAnalysisWindow: config.temporalAnalysisWindow || 24 * 60 * 60 * 1000, // 24 horas
            enableAdvancedClustering: config.enableAdvancedClustering !== false,
            ...config
        };
        
        this.patternDatabase = new Map();
        this.topicClusters = new Map();
        this.temporalPatterns = new Map();
        this.problemSolvingPatterns = new Map();
        
        Logger.info('🔍 PatternDetector inicializado');
    }

    /**
     * Detecta padrões avançados em uma conversa
     */
    async detectAdvancedPatterns(conversation, analysis) {
        try {
            Logger.info(`🔍 Detectando padrões avançados para conversa: ${conversation.id}`);
            
            const patterns = {
                conversationId: conversation.id,
                timestamp: new Date().toISOString(),
                topicClusters: await this.detectTopicClusters(conversation, analysis),
                temporalPatterns: await this.detectTemporalPatterns(conversation, analysis),
                problemSolvingPatterns: await this.detectProblemSolvingPatterns(conversation, analysis),
                collaborationPatterns: await this.detectCollaborationPatterns(conversation, analysis),
                emergingPatterns: await this.detectEmergingPatterns(conversation, analysis)
            };
            
            // Armazenar padrões detectados
            this.patternDatabase.set(conversation.id, patterns);
            
            // Atualizar clusters globais
            await this.updateGlobalPatterns(patterns);
            
            Logger.info(`✅ Padrões avançados detectados para conversa: ${conversation.id}`);
            return patterns;
            
        } catch (error) {
            Logger.error('❌ Erro ao detectar padrões avançados:', error);
            throw error;
        }
    }

    /**
     * Detecta clusters de tópicos usando TF-IDF e similaridade
     */
    async detectTopicClusters(conversation, analysis) {
        try {
            const messages = conversation.messages || [];
            if (messages.length === 0) return { clusters: [], confidence: 0 };
            
            // Extrair palavras-chave usando TF-IDF
            const keywords = await this.extractKeywordsTFIDF(messages);
            
            // Agrupar tópicos por similaridade
            const clusters = await this.clusterTopicsBySimilarity(keywords);
            
            // Calcular confiança baseada na qualidade dos clusters
            const confidence = this.calculateClusterConfidence(clusters, keywords);
            
            return {
                clusters,
                keywords,
                confidence,
                totalTopics: clusters.length
            };
            
        } catch (error) {
            Logger.error('❌ Erro ao detectar clusters de tópicos:', error);
            return { clusters: [], confidence: 0 };
        }
    }

    /**
     * Extrai palavras-chave usando TF-IDF
     */
    async extractKeywordsTFIDF(messages) {
        try {
            // Preparar documentos (mensagens)
            const documents = messages.map(msg => (msg.content || '').toLowerCase());
            
            // Calcular TF (Term Frequency) para cada documento
            const tf = this.calculateTF(documents);
            
            // Calcular IDF (Inverse Document Frequency)
            const idf = this.calculateIDF(documents);
            
            // Calcular TF-IDF scores
            const tfidf = this.calculateTFIDF(tf, idf);
            
            // Extrair top keywords
            const keywords = this.extractTopKeywords(tfidf, this.config.maxTopicsPerConversation);
            
            return keywords;
            
        } catch (error) {
            Logger.error('❌ Erro ao extrair palavras-chave TF-IDF:', error);
            return [];
        }
    }

    /**
     * Calcula TF (Term Frequency) para cada documento
     */
    calculateTF(documents) {
        const tf = [];
        
        documents.forEach(doc => {
            const words = doc.split(/\s+/).filter(word => word.length > 2);
            const wordCount = {};
            const totalWords = words.length;
            
            words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });
            
            // Normalizar por total de palavras
            Object.keys(wordCount).forEach(word => {
                wordCount[word] = wordCount[word] / totalWords;
            });
            
            tf.push(wordCount);
        });
        
        return tf;
    }

    /**
     * Calcula IDF (Inverse Document Frequency)
     */
    calculateIDF(documents) {
        const wordCount = {};
        const totalDocs = documents.length;
        
        documents.forEach(doc => {
            const words = new Set(doc.split(/\s+/).filter(word => word.length > 2));
            words.forEach(word => {
                wordCount[word] = (wordCount[word] || 0) + 1;
            });
        });
        
        const idf = {};
        Object.keys(wordCount).forEach(word => {
            idf[word] = Math.log(totalDocs / wordCount[word]);
        });
        
        return idf;
    }

    /**
     * Calcula TF-IDF scores
     */
    calculateTFIDF(tf, idf) {
        const tfidf = [];
        
        tf.forEach(docTF => {
            const docTFIDF = {};
            Object.keys(docTF).forEach(word => {
                docTFIDF[word] = docTF[word] * (idf[word] || 0);
            });
            tfidf.push(docTFIDF);
        });
        
        return tfidf;
    }

    /**
     * Extrai top keywords baseado em TF-IDF scores
     */
    extractTopKeywords(tfidf, maxKeywords) {
        const wordScores = {};
        
        // Somar scores de todas as mensagens
        tfidf.forEach(doc => {
            Object.keys(doc).forEach(word => {
                wordScores[word] = (wordScores[word] || 0) + doc[word];
            });
        });
        
        // Ordenar por score e retornar top keywords
        return Object.entries(wordScores)
            .sort((a, b) => b[1] - a[1])
            .slice(0, maxKeywords)
            .map(([word, score]) => ({ word, score }));
    }

    /**
     * Agrupa tópicos por similaridade
     */
    async clusterTopicsBySimilarity(keywords) {
        try {
            if (keywords.length === 0) return [];
            
            // Agrupamento simples por similaridade de palavras
            const clusters = [];
            const processed = new Set();
            
            keywords.forEach(({ word, score }) => {
                if (processed.has(word)) return;
                
                const cluster = {
                    id: `cluster_${clusters.length + 1}`,
                    mainTopic: word,
                    relatedTopics: [],
                    confidence: score,
                    size: 1
                };
                
                // Encontrar tópicos relacionados
                keywords.forEach(({ word: otherWord, score: otherScore }) => {
                    if (otherWord !== word && !processed.has(otherWord)) {
                        const similarity = this.calculateWordSimilarity(word, otherWord);
                        if (similarity > 0.6) { // Threshold de similaridade
                            cluster.relatedTopics.push({ word: otherWord, score: otherScore, similarity });
                            cluster.size++;
                            processed.add(otherWord);
                        }
                    }
                });
                
                clusters.push(cluster);
                processed.add(word);
            });
            
            return clusters;
            
        } catch (error) {
            Logger.error('❌ Erro ao agrupar tópicos por similaridade:', error);
            return [];
        }
    }

    /**
     * Calcula similaridade entre palavras
     */
    calculateWordSimilarity(word1, word2) {
        // Similaridade simples baseada em caracteres comuns
        const set1 = new Set(word1.split(''));
        const set2 = new Set(word2.split(''));
        
        const intersection = new Set([...set1].filter(x => set2.has(x)));
        const union = new Set([...set1, ...set2]);
        
        return intersection.size / union.size;
    }

    /**
     * Detecta padrões temporais na conversa
     */
    async detectTemporalPatterns(conversation, analysis) {
        try {
            const messages = conversation.messages || [];
            if (messages.length === 0) return { patterns: [], confidence: 0 };
            
            const patterns = {
                timeDistribution: this.analyzeTimeDistribution(messages),
                responsePatterns: this.analyzeResponsePatterns(messages),
                intensityVariation: this.analyzeIntensityVariation(messages),
                topicEvolution: this.analyzeTopicEvolution(messages)
            };
            
            const confidence = this.calculateTemporalConfidence(patterns);
            
            return {
                patterns,
                confidence,
                totalPatterns: Object.keys(patterns).length
            };
            
        } catch (error) {
            Logger.error('❌ Erro ao detectar padrões temporais:', error);
            return { patterns: [], confidence: 0 };
        }
    }

    /**
     * Analisa distribuição temporal das mensagens
     */
    analyzeTimeDistribution(messages) {
        const timeSlots = {
            morning: 0,    // 6-12h
            afternoon: 0,  // 12-18h
            evening: 0,    // 18-24h
            night: 0       // 0-6h
        };
        
        messages.forEach(msg => {
            const hour = new Date(msg.timestamp).getHours();
            
            if (hour >= 6 && hour < 12) timeSlots.morning++;
            else if (hour >= 12 && hour < 18) timeSlots.afternoon++;
            else if (hour >= 18 && hour < 24) timeSlots.evening++;
            else timeSlots.night++;
        });
        
        return timeSlots;
    }

    /**
     * Analisa padrões de resposta
     */
    analyzeResponsePatterns(messages) {
        const patterns = {
            responseTime: [],
            conversationFlow: [],
            turnTaking: []
        };
        
        for (let i = 1; i < messages.length; i++) {
            const current = messages[i];
            const previous = messages[i - 1];
            
            // Calcular tempo de resposta
            const responseTime = new Date(current.timestamp) - new Date(previous.timestamp);
            patterns.responseTime.push(responseTime);
            
            // Analisar fluxo da conversa
            if (current.sender !== previous.sender) {
                patterns.turnTaking.push({
                    from: previous.sender,
                    to: current.sender,
                    time: responseTime
                });
            }
        }
        
        // Calcular estatísticas
        patterns.avgResponseTime = patterns.responseTime.reduce((a, b) => a + b, 0) / patterns.responseTime.length;
        patterns.turnTakingCount = patterns.turnTaking.length;
        
        return patterns;
    }

    /**
     * Analisa variação de intensidade
     */
    analyzeIntensityVariation(messages) {
        const intensities = messages.map(msg => (msg.content || '').length);
        
        if (intensities.length === 0) return { variation: 0, trend: 'stable' };
        
        const avg = intensities.reduce((a, b) => a + b, 0) / intensities.length;
        const variance = intensities.reduce((acc, val) => acc + Math.pow(val - avg, 2), 0) / intensities.length;
        const stdDev = Math.sqrt(variance);
        
        // Determinar tendência
        let trend = 'stable';
        if (intensities.length > 1) {
            const firstHalf = intensities.slice(0, Math.floor(intensities.length / 2));
            const secondHalf = intensities.slice(Math.floor(intensities.length / 2));
            const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
            const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
            
            if (secondAvg > firstAvg * 1.2) trend = 'increasing';
            else if (secondAvg < firstAvg * 0.8) trend = 'decreasing';
        }
        
        return {
            variation: stdDev / avg, // Coeficiente de variação
            trend,
            averageLength: avg,
            stdDev
        };
    }

    /**
     * Analisa evolução de tópicos ao longo da conversa
     */
    analyzeTopicEvolution(messages) {
        const topicEvolution = [];
        const windowSize = Math.max(3, Math.floor(messages.length / 4)); // Janela adaptativa
        
        for (let i = 0; i < messages.length; i += windowSize) {
            const window = messages.slice(i, i + windowSize);
            const windowTopics = this.extractTopicsFromWindow(window);
            
            topicEvolution.push({
                window: i / windowSize + 1,
                topics: windowTopics,
                messageCount: window.length
            });
        }
        
        return topicEvolution;
    }

    /**
     * Extrai tópicos de uma janela de mensagens
     */
    extractTopicsFromWindow(messages) {
        const content = messages.map(msg => msg.content || '').join(' ').toLowerCase();
        const topics = [];
        
        // Tópicos técnicos comuns
        const technicalTopics = [
            'javascript', 'python', 'database', 'api', 'frontend', 'backend',
            'testing', 'deployment', 'architecture', 'performance', 'security'
        ];
        
        technicalTopics.forEach(topic => {
            if (content.includes(topic)) {
                topics.push(topic);
            }
        });
        
        return topics;
    }

    /**
     * Detecta padrões de resolução de problemas
     */
    async detectProblemSolvingPatterns(conversation, analysis) {
        try {
            const messages = conversation.messages || [];
            if (messages.length === 0) return { patterns: [], confidence: 0 };
            
            const patterns = {
                problemIdentification: this.identifyProblemPatterns(messages),
                solutionAttempts: this.analyzeSolutionAttempts(messages),
                resolutionSuccess: this.analyzeResolutionSuccess(messages),
                iterationPatterns: this.analyzeIterationPatterns(messages)
            };
            
            const confidence = this.calculateProblemSolvingConfidence(patterns);
            
            return {
                patterns,
                confidence,
                totalPatterns: Object.keys(patterns).length
            };
            
        } catch (error) {
            Logger.error('❌ Erro ao detectar padrões de resolução:', error);
            return { patterns: [], confidence: 0 };
        }
    }

    /**
     * Identifica padrões de problemas
     */
    identifyProblemPatterns(messages) {
        const problemIndicators = [
            'erro', 'problema', 'bug', 'não funciona', 'falha',
            'exception', 'crash', 'broken', 'issue', 'trouble'
        ];
        
        const problems = [];
        let currentProblem = null;
        
        messages.forEach((msg, index) => {
            const content = (msg.content || '').toLowerCase();
            
            problemIndicators.forEach(indicator => {
                if (content.includes(indicator)) {
                    if (!currentProblem) {
                        currentProblem = {
                            id: `problem_${problems.length + 1}`,
                            startIndex: index,
                            indicator,
                            context: content.substring(0, 100),
                            status: 'open'
                        };
                        problems.push(currentProblem);
                    }
                }
            });
            
            // Detectar resolução de problema
            if (currentProblem && (content.includes('resolvido') || content.includes('funciona'))) {
                currentProblem.status = 'resolved';
                currentProblem.endIndex = index;
                currentProblem.duration = index - currentProblem.startIndex;
                currentProblem = null;
            }
        });
        
        return {
            totalProblems: problems.length,
            openProblems: problems.filter(p => p.status === 'open').length,
            resolvedProblems: problems.filter(p => p.status === 'resolved').length,
            problems: problems
        };
    }

    /**
     * Analisa tentativas de solução
     */
    analyzeSolutionAttempts(messages) {
        const attempts = [];
        let currentAttempt = null;
        
        messages.forEach((msg, index) => {
            const content = msg.content || '';
            
            // Detectar início de tentativa (código ou comando)
            if (content.includes('```') || content.includes('$ ') || content.includes('npm ') || content.includes('git ')) {
                if (!currentAttempt) {
                    currentAttempt = {
                        id: `attempt_${attempts.length + 1}`,
                        startIndex: index,
                        type: this.classifyAttemptType(content),
                        content: content.substring(0, 100)
                    };
                }
            }
            
            // Detectar resultado da tentativa
            if (currentAttempt && (content.includes('sucesso') || content.includes('erro') || content.includes('falha'))) {
                currentAttempt.endIndex = index;
                currentAttempt.result = this.classifyAttemptResult(content);
                currentAttempt.duration = index - currentAttempt.startIndex;
                attempts.push(currentAttempt);
                currentAttempt = null;
            }
        });
        
        return {
            totalAttempts: attempts.length,
            successfulAttempts: attempts.filter(a => a.result === 'success').length,
            failedAttempts: attempts.filter(a => a.result === 'failure').length,
            attempts: attempts
        };
    }

    /**
     * Classifica tipo de tentativa
     */
    classifyAttemptType(content) {
        if (content.includes('```')) return 'code';
        if (content.includes('$ ') || content.includes('npm ') || content.includes('git ')) return 'command';
        if (content.includes('test') || content.includes('debug')) return 'testing';
        return 'other';
    }

    /**
     * Classifica resultado da tentativa
     */
    classifyAttemptResult(content) {
        const contentLower = content.toLowerCase();
        if (contentLower.includes('sucesso') || contentLower.includes('funciona')) return 'success';
        if (contentLower.includes('erro') || contentLower.includes('falha')) return 'failure';
        return 'unknown';
    }

    /**
     * Analisa sucesso da resolução
     */
    analyzeResolutionSuccess(messages) {
        const successIndicators = ['resolvido', 'funciona', 'sucesso', 'working', 'fixed'];
        const failureIndicators = ['não funciona', 'ainda com problema', 'falha'];
        
        let successCount = 0;
        let failureCount = 0;
        
        messages.forEach(msg => {
            const content = (msg.content || '').toLowerCase();
            
            successIndicators.forEach(indicator => {
                if (content.includes(indicator)) successCount++;
            });
            
            failureIndicators.forEach(indicator => {
                if (content.includes(indicator)) failureCount++;
            });
        });
        
        const total = successCount + failureCount;
        const successRate = total > 0 ? successCount / total : 0;
        
        return {
            successCount,
            failureCount,
            successRate,
            totalIndicators: total
        };
    }

    /**
     * Analisa padrões de iteração
     */
    analyzeIterationPatterns(messages) {
        const iterations = [];
        let currentIteration = 0;
        
        messages.forEach((msg, index) => {
            const content = (msg.content || '').toLowerCase();
            
            // Detectar nova iteração
            if (content.includes('tentar novamente') || content.includes('outra abordagem') || content.includes('alternativa')) {
                currentIteration++;
            }
            
            // Detectar código ou tentativa
            if (content.includes('```') || content.includes('$ ')) {
                iterations.push({
                    iteration: currentIteration,
                    index,
                    type: this.classifyAttemptType(content)
                });
            }
        });
        
        return {
            totalIterations: currentIteration + 1,
            attemptsPerIteration: iterations.length / Math.max(1, currentIteration + 1),
            iterations: iterations
        };
    }

    /**
     * Detecta padrões de colaboração
     */
    async detectCollaborationPatterns(conversation, analysis) {
        try {
            const messages = conversation.messages || [];
            if (messages.length === 0) return { patterns: [], confidence: 0 };
            
            const patterns = {
                knowledgeSharing: this.analyzeKnowledgeSharing(messages),
                feedbackPatterns: this.analyzeFeedbackPatterns(messages),
                collaborativeProblemSolving: this.analyzeCollaborativeProblemSolving(messages),
                communicationStyle: this.analyzeCommunicationStyle(messages)
            };
            
            const confidence = this.calculateCollaborationConfidence(patterns);
            
            return {
                patterns,
                confidence,
                totalPatterns: Object.keys(patterns).length
            };
            
        } catch (error) {
            Logger.error('❌ Erro ao detectar padrões de colaboração:', error);
            return { patterns: [], confidence: 0 };
        }
    }

    /**
     * Analisa compartilhamento de conhecimento
     */
    analyzeKnowledgeSharing(messages) {
        const sharingIndicators = [
            'explicar', 'entender', 'conceito', 'como funciona',
            'exemplo', 'demonstração', 'tutorial', 'documentação'
        ];
        
        let sharingCount = 0;
        const sharingInstances = [];
        
        messages.forEach((msg, index) => {
            const content = (msg.content || '').toLowerCase();
            
            sharingIndicators.forEach(indicator => {
                if (content.includes(indicator)) {
                    sharingCount++;
                    sharingInstances.push({
                        index,
                        indicator,
                        content: content.substring(0, 100)
                    });
                }
            });
        });
        
        return {
            totalSharing: sharingCount,
            sharingRate: sharingCount / messages.length,
            instances: sharingInstances
        };
    }

    /**
     * Analisa padrões de feedback
     */
    analyzeFeedbackPatterns(messages) {
        const feedbackIndicators = [
            'feedback', 'opinião', 'sugestão', 'melhoria',
            'crítica', 'avaliação', 'revisão', 'comentário'
        ];
        
        let feedbackCount = 0;
        const feedbackInstances = [];
        
        messages.forEach((msg, index) => {
            const content = (msg.content || '').toLowerCase();
            
            feedbackIndicators.forEach(indicator => {
                if (content.includes(indicator)) {
                    feedbackCount++;
                    feedbackInstances.push({
                        index,
                        indicator,
                        content: content.substring(0, 100)
                    });
                }
            });
        });
        
        return {
            totalFeedback: feedbackCount,
            feedbackRate: feedbackCount / messages.length,
            instances: feedbackInstances
        };
    }

    /**
     * Analisa resolução colaborativa de problemas
     */
    analyzeCollaborativeProblemSolving(messages) {
        const collaborationIndicators = [
            'juntos', 'colaborar', 'equipe', 'ajudar',
            'trabalhar em conjunto', 'cooperar', 'parceria'
        ];
        
        let collaborationCount = 0;
        const collaborationInstances = [];
        
        messages.forEach((msg, index) => {
            const content = (msg.content || '').toLowerCase();
            
            collaborationIndicators.forEach(indicator => {
                if (content.includes(indicator)) {
                    collaborationCount++;
                    collaborationInstances.push({
                        index,
                        indicator,
                        content: content.substring(0, 100)
                    });
                }
            });
        });
        
        return {
            totalCollaboration: collaborationCount,
            collaborationRate: collaborationCount / messages.length,
            instances: collaborationInstances
        };
    }

    /**
     * Analisa estilo de comunicação
     */
    analyzeCommunicationStyle(messages) {
        const styles = {
            formal: 0,
            informal: 0,
            technical: 0,
            explanatory: 0
        };
        
        messages.forEach(msg => {
            const content = msg.content || '';
            
            // Análise básica de estilo
            if (content.includes('por favor') || content.includes('obrigado')) styles.formal++;
            if (content.includes('!') || content.includes('😊')) styles.informal++;
            if (content.includes('```') || content.includes('function') || content.includes('class')) styles.technical++;
            if (content.includes('porque') || content.includes('exemplo') || content.includes('assim')) styles.explanatory++;
        });
        
        // Determinar estilo dominante
        const total = Object.values(styles).reduce((a, b) => a + b, 0);
        const dominantStyle = Object.entries(styles).reduce((a, b) => styles[a] > styles[b] ? a : b);
        
        return {
            styles,
            total,
            dominantStyle,
            distribution: Object.fromEntries(
                Object.entries(styles).map(([style, count]) => [style, count / total])
            )
        };
    }

    /**
     * Detecta padrões emergentes
     */
    async detectEmergingPatterns(conversation, analysis) {
        try {
            const messages = conversation.messages || [];
            if (messages.length === 0) return { patterns: [], confidence: 0 };
            
            const patterns = {
                unexpectedConnections: this.findUnexpectedConnections(messages),
                patternAnomalies: this.detectPatternAnomalies(messages),
                emergingTopics: this.identifyEmergingTopics(messages),
                behavioralShifts: this.detectBehavioralShifts(messages)
            };
            
            const confidence = this.calculateEmergingPatternsConfidence(patterns);
            
            return {
                patterns,
                confidence,
                totalPatterns: Object.keys(patterns).length
            };
            
        } catch (error) {
            Logger.error('❌ Erro ao detectar padrões emergentes:', error);
            return { patterns: [], confidence: 0 };
        }
    }

    /**
     * Encontra conexões inesperadas
     */
    findUnexpectedConnections(messages) {
        const connections = [];
        const content = messages.map(msg => msg.content || '').join(' ').toLowerCase();
        
        // Detectar combinações inesperadas de tópicos
        const topicCombinations = [
            ['javascript', 'python'],
            ['frontend', 'database'],
            ['testing', 'deployment'],
            ['performance', 'security']
        ];
        
        topicCombinations.forEach(([topic1, topic2]) => {
            if (content.includes(topic1) && content.includes(topic2)) {
                connections.push({
                    type: 'topic_combination',
                    topics: [topic1, topic2],
                    description: `Combinação inesperada de ${topic1} e ${topic2}`
                });
            }
        });
        
        return connections;
    }

    /**
     * Detecta anomalias de padrões
     */
    detectPatternAnomalies(messages) {
        const anomalies = [];
        
        // Detectar mensagens muito longas ou muito curtas
        const lengths = messages.map(msg => (msg.content || '').length);
        const avgLength = lengths.reduce((a, b) => a + b, 0) / lengths.length;
        const stdDev = Math.sqrt(lengths.reduce((acc, val) => acc + Math.pow(val - avgLength, 2), 0) / lengths.length);
        
        messages.forEach((msg, index) => {
            const length = (msg.content || '').length;
            if (length > avgLength + 2 * stdDev || length < avgLength - 2 * stdDev) {
                anomalies.push({
                    type: 'length_anomaly',
                    index,
                    length,
                    expected: avgLength,
                    deviation: Math.abs(length - avgLength) / stdDev
                });
            }
        });
        
        return anomalies;
    }

    /**
     * Identifica tópicos emergentes
     */
    identifyEmergingTopics(messages) {
        const emergingTopics = [];
        const content = messages.map(msg => msg.content || '').join(' ').toLowerCase();
        
        // Tópicos emergentes em tecnologia
        const emergingTechTopics = [
            'ai', 'machine learning', 'blockchain', 'iot', 'edge computing',
            'serverless', 'microservices', 'kubernetes', 'docker', 'cloud native'
        ];
        
        emergingTechTopics.forEach(topic => {
            if (content.includes(topic)) {
                emergingTopics.push({
                    topic,
                    type: 'emerging_technology',
                    description: `Tópico emergente detectado: ${topic}`
                });
            }
        });
        
        return emergingTopics;
    }

    /**
     * Detecta mudanças comportamentais
     */
    detectBehavioralShifts(messages) {
        const shifts = [];
        
        if (messages.length < 4) return shifts;
        
        // Dividir mensagens em duas metades
        const firstHalf = messages.slice(0, Math.floor(messages.length / 2));
        const secondHalf = messages.slice(Math.floor(messages.length / 2));
        
        // Analisar mudanças no estilo de comunicação
        const firstStyle = this.analyzeCommunicationStyle(firstHalf);
        const secondStyle = this.analyzeCommunicationStyle(secondHalf);
        
        // Detectar mudanças significativas
        Object.keys(firstStyle.distribution).forEach(style => {
            const change = Math.abs(secondStyle.distribution[style] - firstStyle.distribution[style]);
            if (change > 0.3) { // Mudança significativa
                shifts.push({
                    type: 'communication_style_shift',
                    style,
                    change,
                    from: firstStyle.distribution[style],
                    to: secondStyle.distribution[style]
                });
            }
        });
        
        return shifts;
    }

    // ===== MÉTODOS DE CÁLCULO DE CONFIANÇA =====

    calculateClusterConfidence(clusters, keywords) {
        if (clusters.length === 0 || keywords.length === 0) return 0;
        
        const avgClusterSize = clusters.reduce((sum, cluster) => sum + cluster.size, 0) / clusters.length;
        const keywordCoverage = clusters.reduce((sum, cluster) => sum + cluster.relatedTopics.length, 0) / keywords.length;
        
        return Math.min(1, (avgClusterSize * 0.4 + keywordCoverage * 0.6));
    }

    calculateTemporalConfidence(patterns) {
        const factors = [
            patterns.timeDistribution ? 1 : 0,
            patterns.responsePatterns ? 1 : 0,
            patterns.intensityVariation ? 1 : 0,
            patterns.topicEvolution ? 1 : 0
        ];
        
        return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    }

    calculateProblemSolvingConfidence(patterns) {
        const factors = [
            patterns.problemIdentification ? 1 : 0,
            patterns.solutionAttempts ? 1 : 0,
            patterns.resolutionSuccess ? 1 : 0,
            patterns.iterationPatterns ? 1 : 0
        ];
        
        return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    }

    calculateCollaborationConfidence(patterns) {
        const factors = [
            patterns.knowledgeSharing ? 1 : 0,
            patterns.feedbackPatterns ? 1 : 0,
            patterns.collaborativeProblemSolving ? 1 : 0,
            patterns.communicationStyle ? 1 : 0
        ];
        
        return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    }

    calculateEmergingPatternsConfidence(patterns) {
        const factors = [
            patterns.unexpectedConnections ? 1 : 0,
            patterns.patternAnomalies ? 1 : 0,
            patterns.emergingTopics ? 1 : 0,
            patterns.behavioralShifts ? 1 : 0
        ];
        
        return factors.reduce((sum, factor) => sum + factor, 0) / factors.length;
    }

    // ===== MÉTODOS DE ATUALIZAÇÃO GLOBAL =====

    async updateGlobalPatterns(patterns) {
        try {
            // Atualizar clusters globais
            if (patterns.topicClusters) {
                await this.updateTopicClusters(patterns.topicClusters);
            }
            
            // Atualizar padrões temporais
            if (patterns.temporalPatterns) {
                await this.updateTemporalPatterns(patterns.temporalPatterns);
            }
            
            // Atualizar padrões de resolução
            if (patterns.problemSolvingPatterns) {
                await this.updateProblemSolvingPatterns(patterns.problemSolvingPatterns);
            }
            
            Logger.info('✅ Padrões globais atualizados');
            
        } catch (error) {
            Logger.error('❌ Erro ao atualizar padrões globais:', error);
        }
    }

    async updateTopicClusters(topicClusters) {
        // Implementar lógica de atualização de clusters globais
        // Por enquanto, apenas armazenar
        this.topicClusters.set(Date.now(), topicClusters);
    }

    async updateTemporalPatterns(temporalPatterns) {
        // Implementar lógica de atualização de padrões temporais
        this.temporalPatterns.set(Date.now(), temporalPatterns);
    }

    async updateProblemSolvingPatterns(problemSolvingPatterns) {
        // Implementar lógica de atualização de padrões de resolução
        this.problemSolvingPatterns.set(Date.now(), problemSolvingPatterns);
    }

    // ===== MÉTODOS DE UTILIDADE =====

    /**
     * Obtém padrões detectados para uma conversa
     */
    getDetectedPatterns(conversationId) {
        return this.patternDatabase.get(conversationId);
    }

    /**
     * Obtém estatísticas de padrões
     */
    getPatternStats() {
        return {
            totalConversations: this.patternDatabase.size,
            totalTopicClusters: this.topicClusters.size,
            totalTemporalPatterns: this.temporalPatterns.size,
            totalProblemSolvingPatterns: this.problemSolvingPatterns.size
        };
    }

    /**
     * Limpa banco de padrões
     */
    clearPatternDatabase() {
        this.patternDatabase.clear();
        this.topicClusters.clear();
        this.temporalPatterns.clear();
        this.problemSolvingPatterns.clear();
        Logger.info('🧹 Banco de padrões limpo');
    }
}

export default PatternDetector;
