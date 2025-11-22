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

// News API endpoint
app.get('/api/news', async (req, res) => {
    try {
        const { topic = 'general' } = req.query;

        const TOPIC_QUERIES = {
            general: 'chess OR "chess game" OR grandmaster',
            tournaments: 'chess tournament OR "chess championship" OR FIDE',
            strategy: 'chess strategy OR "chess opening" OR "chess tactics" OR "chess endgame"',
            openings: 'chess openings OR "chess theory" OR "opening preparation"',
            grandmasters: 'chess grandmaster OR "GM" OR "super GM"',
            'world-championship': 'world chess championship OR "FIDE world championship"'
        };

        // Use predefined query if it exists, otherwise use the topic directly as a search term
        const query = TOPIC_QUERIES[topic.toLowerCase()] || `chess ${topic}`;

        console.log(`News API Query for topic "${topic}": "${query}"`);

        // Get articles from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

        console.log(`Date range: from ${fromDate} to today`);

        const newsApiKey = process.env.NEWS_API_KEY || '4e4cd13134ac4c17b9229352da68b284';
        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=relevancy&pageSize=10&apiKey=${newsApiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`News API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform News API response
        const articles = data.articles.map((article, index) => ({
            id: index + 1,
            title: article.title,
            summary: article.description || article.content?.substring(0, 200) || 'No description available',
            date: new Date(article.publishedAt).toISOString().split('T')[0],
            source: article.source.name,
            url: article.url,
            image: article.urlToImage
        }));

        res.json(articles);
    } catch (error) {
        console.error('News API error:', error);
        res.status(500).json({
            error: 'Failed to fetch news',
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
