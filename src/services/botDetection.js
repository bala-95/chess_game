// AI-powered bot detection using Gemini AI backend
const API_URL = '/api/analyze-bot';

class BotDetectionService {
    constructor() {
        this.interactions = [];
        this.startTime = Date.now();
    }

    trackInteraction(type, data = {}) {
        this.interactions.push({
            type,
            timestamp: Date.now(),
            ...data
        });
    }

    async analyze() {
        const timeSinceStart = Date.now() - this.startTime;

        try {
            // Call backend AI service
            const response = await fetch(API_URL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    interactions: this.interactions,
                    timeSinceStart
                })
            });

            if (!response.ok) {
                throw new Error('Backend API error');
            }

            const analysis = await response.json();

            return {
                isSuspicious: analysis.isSuspicious,
                confidence: analysis.confidence,
                reasoning: analysis.reasoning,
                source: analysis.source
            };
        } catch (error) {
            console.error('Bot detection API error:', error);

            // Fallback to local heuristics if backend is unavailable
            return this.localAnalysis(timeSinceStart);
        }
    }

    localAnalysis(timeSinceStart) {
        const interactionCount = this.interactions.length;

        const isSuspicious =
            timeSinceStart < 2000 ||
            interactionCount < 3 ||
            this.checkPattern();

        return {
            isSuspicious,
            confidence: isSuspicious ? 0.6 : 0.2,
            reasoning: 'Local heuristic analysis (backend unavailable)',
            source: 'local-fallback'
        };
    }

    checkPattern() {
        // Check for robotic timing patterns
        if (this.interactions.length < 2) return false;

        const intervals = [];
        for (let i = 1; i < this.interactions.length; i++) {
            intervals.push(
                this.interactions[i].timestamp - this.interactions[i - 1].timestamp
            );
        }

        // If all intervals are suspiciously similar, might be a bot
        const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
        const variance = intervals.reduce((sum, interval) => {
            return sum + Math.pow(interval - avgInterval, 2);
        }, 0) / intervals.length;

        return variance < 100; // Very low variance suggests automation
    }

    reset() {
        this.interactions = [];
        this.startTime = Date.now();
    }
}

export const botDetection = new BotDetectionService();
