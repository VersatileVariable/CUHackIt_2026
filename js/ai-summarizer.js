/**
 * ClearPath AI Summarization Module
 * Handles conversation topic generation from speech transcripts
 * Uses lightweight AI API integration for real-time summarization
 */

(function() {
    'use strict';

    // AI Summarization State
    let isActive = false;
    let currentTranscript = '';
    let lastSummary = '';
    let summaryTimer = null;
    let requestInProgress = false;

    // Configuration
    const config = {
        apiEndpoint: null,          // Will be configured to use available AI service
        apiKey: null,               // For services that require API keys
        updateIntervalMs: 10000,    // Update every 10 seconds
        minTranscriptLength: 50,    // Minimum characters before summarizing
        maxTranscriptLength: 1000,  // Maximum characters to send to API
        maxSummaryLength: 60,       // Maximum characters in summary
        useLocalFallback: true,     // Use local summarization if API fails
        retryAttempts: 2,
        timeoutMs: 5000
    };

    // Fallback keyword extraction for offline mode
    const keywordCategories = {
        family: ['family', 'mother', 'father', 'sister', 'brother', 'child', 'parent', 'relative'],
        work: ['work', 'job', 'office', 'colleague', 'meeting', 'project', 'business', 'career'],
        health: ['doctor', 'hospital', 'medicine', 'treatment', 'health', 'sick', 'pain', 'therapy'],
        social: ['friend', 'party', 'celebration', 'visit', 'movie', 'dinner', 'vacation', 'weekend'],
        hobby: ['garden', 'cooking', 'reading', 'music', 'sports', 'art', 'travel', 'photography'],
        technology: ['computer', 'phone', 'internet', 'app', 'software', 'email', 'online'],
        daily: ['today', 'yesterday', 'tomorrow', 'morning', 'afternoon', 'evening', 'weather']
    };

    // Initialize AI summarization
    function initAISummarization() {
        console.log('🤖 Initializing AI summarization...');
        
        // Try to detect available AI services
        detectAvailableAIServices();
        
        updateStatus('AI summarization ready');
        console.log('✅ AI summarization initialized');
        return true;
    }

    // Detect available AI services
    function detectAvailableAIServices() {
        // For hackathon: Use local fallback initially
        // Can be extended to integrate with OpenAI, Anthropic, etc.
        
        if (config.useLocalFallback) {
            console.log('🤖 Using local fallback summarization');
            config.apiEndpoint = 'local';
        }
        
        // Could add integration with:
        // - OpenAI GPT-3.5/4
        // - Anthropic Claude
        // - Google Cloud AI
        // - Azure Cognitive Services
        // - Local AI models via WebAssembly
        
        console.log('🔍 AI service detection complete');
    }

    // Start AI summarization
    function startAI() {
        if (!isActive) {
            isActive = true;
            startPeriodicSummarization();
            updateStatus('AI topic generation active');
            console.log('🚀 AI summarization started');
        }
    }

    // Stop AI summarization
    function stopAI() {
        if (isActive) {
            isActive = false;
            if (summaryTimer) {
                clearInterval(summaryTimer);
                summaryTimer = null;
            }
            updateStatus('AI topic generation stopped');
            console.log('⏹️ AI summarization stopped');
        }
    }

    // Toggle AI summarization
    function toggleAI() {
        if (isActive) {
            stopAI();
        } else {
            startAI();
        }
    }

    // Start periodic summarization
    function startPeriodicSummarization() {
        if (summaryTimer) {
            clearInterval(summaryTimer);
        }
        
        summaryTimer = setInterval(async () => {
            if (isActive && currentTranscript.length > config.minTranscriptLength) {
                await generateTopicSummary();
            }
        }, config.updateIntervalMs);
        
        console.log('⏰ Periodic summarization started');
    }

    // Update transcript from speech recognition
    function updateTranscript(transcript) {
        currentTranscript = transcript.trim();
        
        // Limit transcript length to prevent API overload
        if (currentTranscript.length > config.maxTranscriptLength) {
            currentTranscript = '...' + currentTranscript.slice(-(config.maxTranscriptLength - 3));
        }
        
        console.log('📝 Transcript updated:', currentTranscript.length, 'characters');
        
        // Trigger immediate summary if significant content
        if (isActive && currentTranscript.length > config.minTranscriptLength * 2) {
            setTimeout(() => generateTopicSummary(), 1000);
        }
    }

    // Generate topic summary
    async function generateTopicSummary() {
        if (requestInProgress || !currentTranscript.trim()) {
            return;
        }

        requestInProgress = true;
        console.log('🤖 Generating topic summary...');

        try {
            let summary = '';
            
            if (config.apiEndpoint === 'local') {
                summary = await generateLocalSummary(currentTranscript);
            } else {
                summary = await generateAISummary(currentTranscript);
            }

            if (summary && summary !== lastSummary) {
                lastSummary = summary;
                updateTopicDisplay(summary);
                
                // Send TOPIC_CHANGED command to belt clip
                if (window.serialModule && window.serialModule.isConnected()) {
                    window.serialModule.sendCommand('TOPIC_CHANGED');
                    console.log('🔗 Topic change sent to belt clip');
                }
                
                console.log('✅ Topic summary generated:', summary);
            }

        } catch (error) {
            console.error('❌ Error generating summary:', error);
            
            // Fallback to local summarization
            if (config.apiEndpoint !== 'local') {
                console.log('🔄 Falling back to local summarization...');
                try {
                    const summary = await generateLocalSummary(currentTranscript);
                    if (summary && summary !== lastSummary) {
                        lastSummary = summary;
                        updateTopicDisplay(summary);
                        
                        // Send TOPIC_CHANGED command to belt clip
                        if (window.serialModule && window.serialModule.isConnected()) {
                            window.serialModule.sendCommand('TOPIC_CHANGED');
                            console.log('🔗 Topic change sent to belt clip (fallback)');
                        }
                    }
                } catch (fallbackError) {
                    console.error('❌ Local summarization failed:', fallbackError);
                    updateStatus('Topic generation failed');
                }
            }
        }

        requestInProgress = false;
    }

    // Generate AI summary using external API
    async function generateAISummary(transcript) {
        // Placeholder for external AI API integration
        // This would integrate with OpenAI, Anthropic, etc.
        
        const prompt = `Summarize this conversation in 3-5 words that capture the main topic: "${transcript}"`;
        
        // Example API call structure:
        /*
        const response = await fetch(config.apiEndpoint, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${config.apiKey}`
            },
            body: JSON.stringify({
                prompt: prompt,
                max_tokens: 10,
                temperature: 0.3
            })
        });
        
        const data = await response.json();
        return data.choices[0].text.trim();
        */
        
        // For hackathon: fallback to local processing
        return await generateLocalSummary(transcript);
    }

    // Generate local summary using keyword extraction
    async function generateLocalSummary(transcript) {
        console.log('🏠 Generating local summary...');
        
        const lowerTranscript = transcript.toLowerCase();
        const words = lowerTranscript.split(/\s+/);
        
        // Count occurrences of keywords by category
        const categoryScores = {};
        
        for (const [category, keywords] of Object.entries(keywordCategories)) {
            categoryScores[category] = 0;
            
            for (const keyword of keywords) {
                const count = lowerTranscript.split(keyword).length - 1;
                categoryScores[category] += count;
            }
        }
        
        // Find the most prominent category
        const topCategory = Object.entries(categoryScores)
            .sort(([,a], [,b]) => b - a)[0];
        
        // Extract key phrases
        const phrases = extractKeyPhrases(transcript);
        
        // Generate summary based on category and phrases
        let summary = '';
        
        if (topCategory && topCategory[1] > 0) {
            const categoryName = topCategory[0];
            
            switch (categoryName) {
                case 'family':
                    summary = phrases.length > 0 ? `Family: ${phrases[0]}` : 'Family discussion';
                    break;
                case 'work':
                    summary = phrases.length > 0 ? `Work: ${phrases[0]}` : 'Work conversation';
                    break;
                case 'health':
                    summary = phrases.length > 0 ? `Health: ${phrases[0]}` : 'Health topic';
                    break;
                case 'social':
                    summary = phrases.length > 0 ? `Social: ${phrases[0]}` : 'Social activity';
                    break;
                case 'hobby':
                    summary = phrases.length > 0 ? `Hobby: ${phrases[0]}` : 'Hobby discussion';
                    break;
                case 'technology':
                    summary = phrases.length > 0 ? `Tech: ${phrases[0]}` : 'Technology topic';
                    break;
                case 'daily':
                    summary = phrases.length > 0 ? `Daily: ${phrases[0]}` : 'Daily conversation';
                    break;
                default:
                    summary = phrases.length > 0 ? phrases[0] : 'General conversation';
            }
        } else if (phrases.length > 0) {
            summary = phrases[0];
        } else {
            summary = 'General conversation';
        }
        
        // Limit summary length
        if (summary.length > config.maxSummaryLength) {
            summary = summary.substring(0, config.maxSummaryLength - 3) + '...';
        }
        
        console.log('📋 Local summary generated:', summary);
        return summary;
    }

    // Extract key phrases from transcript
    function extractKeyPhrases(transcript) {
        // Simple phrase extraction based on common patterns
        const sentences = transcript.split(/[.!?]+/);
        const phrases = [];
        
        for (const sentence of sentences) {
            const words = sentence.trim().split(/\s+/);
            
            // Extract noun phrases (simplified)
            if (words.length >= 2 && words.length <= 5) {
                const phrase = words.join(' ').trim();
                if (phrase.length > 5 && phrase.length <= 30) {
                    phrases.push(phrase);
                }
            }
        }
        
        // Sort by relevance (longer phrases first, then by common words)
        phrases.sort((a, b) => {
            const scoreA = a.length + countCommonWords(a);
            const scoreB = b.length + countCommonWords(b);
            return scoreB - scoreA;
        });
        
        return phrases.slice(0, 3); // Return top 3 phrases
    }

    // Count common/important words in phrase
    function countCommonWords(phrase) {
        const importantWords = ['important', 'need', 'want', 'love', 'like', 'think', 'feel', 'know', 'see', 'hear'];
        const words = phrase.toLowerCase().split(/\s+/);
        
        let score = 0;
        for (const word of words) {
            if (importantWords.includes(word)) {
                score += 2;
            }
        }
        return score;
    }

    // Update topic display in AR
    function updateTopicDisplay(summary) {
        if (window.updateTopic) {
            window.updateTopic(summary);
        }
        
        console.log('📊 Topic display updated:', summary);
    }

    // Update status display
    function updateStatus(message) {
        const statusEl = document.getElementById('aiStatus');
        if (statusEl) {
            statusEl.textContent = `AI: ${message}`;
            statusEl.className = isActive ? 'status-item active' : 'status-item';
        }
        
        if (window.updateStatusText) {
            window.updateStatusText(message);
        }
    }

    // Get current status
    function getStatus() {
        return {
            isActive: isActive,
            transcriptLength: currentTranscript.length,
            lastSummary: lastSummary,
            requestInProgress: requestInProgress,
            apiEndpoint: config.apiEndpoint
        };
    }

    // Configure API settings
    function configureAPI(endpoint, apiKey) {
        config.apiEndpoint = endpoint;
        config.apiKey = apiKey;
        console.log('🔧 AI API configured:', endpoint);
    }

    // Export AI module to global scope
    window.aiModule = {
        init: initAISummarization,
        start: startAI,
        stop: stopAI,
        toggle: toggleAI,
        updateTranscript: updateTranscript,
        getStatus: getStatus,
        configureAPI: configureAPI,
        config: config
    };

    // Auto-initialize when DOM is ready
    document.addEventListener('DOMContentLoaded', function() {
        console.log('🤖 AI Summarization Module Loaded');
        initAISummarization();
        updateStatus('Ready');
    });

    console.log('✅ ClearPath AI Summarization Module Ready');

})();