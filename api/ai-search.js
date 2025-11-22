const BASE_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent';

async function generateContent(prompt, apiKey) {
    const response = await fetch(`${BASE_URL}?key=${apiKey}`, {
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

export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'POST') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: 'Invalid query'
            });
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            throw new Error('GEMINI_API_KEY not configured');
        }

        const prompt = `You are a helpful chess assistant. Answer the following query concisely and accurately. If the query is about chess news, summarize recent events based on your knowledge cutoff.
        
        Query: ${query}
        
        Response:`;

        const text = await generateContent(prompt, apiKey);

        res.status(200).json({
            text: text,
            source: 'gemini-ai'
        });
    } catch (error) {
        console.error('AI Search handler error:', error);

        // Fallback for demonstration if API key is invalid
        if (error.message.includes('API keys are not supported') || error.message.includes('401')) {
            return res.status(200).json({
                text: `(Mock Response - API Key Invalid)\n\nThe current World Chess Champion is Ding Liren. He defeated Ian Nepomniachtchi in the 2023 World Chess Championship match.`,
                source: 'mock-fallback'
            });
        }

        res.status(500).json({
            error: 'Failed to perform search',
            message: error.message
        });
    }
}
