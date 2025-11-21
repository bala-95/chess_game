import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

async function analyzeBotBehavior(interactionData) {
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

export default async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
    res.setHeader(
        'Access-Control-Allow-Headers',
        'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
    );

    if (req.method === 'OPTIONS') {
        res.status(200).end();
        return;
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { interactions, timeSinceStart } = req.body;

        if (!interactions || typeof timeSinceStart !== 'number') {
            return res.status(400).json({
                error: 'Invalid request data'
            });
        }

        const interactionData = {
            interactions,
            interactionCount: interactions.length,
            timeSinceStart
        };

        const analysis = await analyzeBotBehavior(interactionData);

        res.status(200).json(analysis);
    } catch (error) {
        console.error('Bot analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze behavior',
            message: error.message
        });
    }
}
