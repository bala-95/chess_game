export default async function handler(req, res) {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

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

        // Get articles from the last 30 days
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

        const newsApiKey = process.env.NEWS_API_KEY;
        if (!newsApiKey) {
            throw new Error('NEWS_API_KEY not configured');
        }

        const url = `https://newsapi.org/v2/everything?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=relevancy&pageSize=10&apiKey=${newsApiKey}`;

        const response = await fetch(url);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('News API error:', response.status, errorText);
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

        res.status(200).json(articles);
    } catch (error) {
        console.error('News API handler error:', error);
        res.status(500).json({
            error: 'Failed to fetch news',
            message: error.message
        });
    }
}
