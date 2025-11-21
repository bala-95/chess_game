import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { analyzeBotBehavior } from './services/geminiAI.js';

dotenv.config();

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

app.listen(PORT, () => {
    console.log(`🤖 Bot Detection API running on http://localhost:${PORT}`);
    console.log(`📊 Gemini AI integration active`);
});
