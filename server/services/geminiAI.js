import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

export async function analyzeBotBehavior(interactionData) {
    try {
        const model = genAI.getGenerativeModel({ model: 'gemini-pro' });

        const prompt = `You are a bot detection system. Analyze the following user interaction data and determine if it appears to be from a human or a bot.

Interaction Data:
- Number of interactions: ${interactionData.interactionCount}
- Time spent (ms): ${interactionData.timeSinceStart}
- Interaction types: ${JSON.stringify(interactionData.interactions)}

Based on this data, provide a JSON response with:
{
  "isSuspicious": boolean,
  "confidence": number (0-1),
  "reasoning": string
}

Consider factors like:
- Too fast completion (< 2 seconds is suspicious)
- Very low interaction count (< 3 is suspicious)
- Timing patterns that are too regular (robotic)
- Natural human variation in timing

Respond ONLY with valid JSON, no additional text.`;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        const text = response.text();

        // Parse the JSON response
        const analysis = JSON.parse(text.trim());

        return {
            isSuspicious: analysis.isSuspicious || false,
            confidence: analysis.confidence || 0,
            reasoning: analysis.reasoning || 'AI analysis completed',
            source: 'gemini-ai'
        };
    } catch (error) {
        console.error('Gemini AI Error:', error);

        // Fallback to basic heuristics if AI fails
        const isSuspicious =
            interactionData.timeSinceStart < 2000 ||
            interactionData.interactionCount < 3;

        return {
            isSuspicious,
            confidence: 0.5,
            reasoning: 'Fallback heuristic analysis (AI unavailable)',
            source: 'fallback'
        };
    }
}
