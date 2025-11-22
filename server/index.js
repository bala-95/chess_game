import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import * as url from 'url'; // Changed from named import

const __dirname = path.dirname(url.fileURLToPath(import.meta.url)); // Updated usage
dotenv.config({ path: path.join(__dirname, '../.env.local') });
dotenv.config();

import * as gemini from './services/geminiAI.js';
const { analyzeBotBehavior, performSearch } = gemini;

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'chess-game-bot-detection' });
});

// Bot detection endpoint
app.post('/api/analyze-bot', async (req, res) => {
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

        res.json(analysis);
    } catch (error) {
        console.error('Bot analysis error:', error);
        res.status(500).json({
            error: 'Failed to analyze behavior',
            message: error.message
        });
    }
});

// AI Search endpoint
app.post('/api/ai-search', async (req, res) => {
    try {
        const { query } = req.body;

        if (!query || typeof query !== 'string') {
            return res.status(400).json({
                error: 'Invalid query'
            });
        }

        const result = await performSearch(query);
        res.json(result);
    } catch (error) {
        console.error('Search error:', error);
        res.status(500).json({
            error: 'Failed to perform search',
            message: error.message
        });
    }
});

app.listen(PORT, () => {
    console.log(`🤖 Bot Detection API running on http://localhost:${PORT}`);
    console.log(`📊 Gemini AI integration active`);
    console.log(`🔑 GEMINI_API_KEY present: ${!!process.env.GEMINI_API_KEY}`);
    console.log(`🔑 VITE_VERTEX_AI_KEY present: ${!!process.env.VITE_VERTEX_AI_KEY}`);
});
