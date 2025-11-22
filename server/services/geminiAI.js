const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

async function generateContent(prompt) {
    const API_KEY = (process.env.GEMINI_API_KEY || process.env.VITE_VERTEX_AI_KEY || '').trim();

    if (!API_KEY) {
        throw new Error('API Key is missing');
    }

    const response = await fetch(`${BASE_URL}?key=${API_KEY}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            contents: [{
                parts: [{ text: prompt }]
            }]
        })
    });

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    const data = await response.json();

    if (!data.candidates || data.candidates.length === 0 || !data.candidates[0].content) {
        throw new Error('No content generated');
    }

    return data.candidates[0].content.parts[0].text;
}

export async function analyzeBotBehavior(interactionData) {
    try {
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

        const text = await generateContent(prompt);

        // Parse the JSON response
        // Clean up markdown code blocks if present
        const jsonText = text.replace(/```json/g, '').replace(/```/g, '').trim();
        const analysis = JSON.parse(jsonText);

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

export async function performSearch(query) {
    try {
        const prompt = `You are a helpful chess assistant. Answer the following query concisely and accurately. If the query is about chess news, summarize recent events based on your knowledge cutoff.
        
        Query: ${query}
        
        Response:`;

        const text = await generateContent(prompt);

        return {
            text: text,
            source: 'gemini-ai'
        };
    } catch (error) {
        console.error('Gemini Search Error:', error);

        // Fallback for demonstration if API key is invalid
        if (error.message.includes('API keys are not supported') || error.message.includes('401')) {
            return {
                text: `(Mock Response - API Key Invalid)\n\nThe current World Chess Champion is Ding Liren. He defeated Ian Nepomniachtchi in the 2023 World Chess Championship match.`,
                source: 'mock-fallback'
            };
        }

        return {
            text: 'Sorry, I encountered an error while processing your request.',
            error: error.message,
            source: 'error'
        };
    }
}
