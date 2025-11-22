const NEWS_API_KEY = '4e4cd13134ac4c17b9229352da68b284';
const NEWS_API_BASE_URL = 'https://newsapi.org/v2/everything';

// Map topics to search queries
const TOPIC_QUERIES = {
    general: 'chess OR "chess game" OR grandmaster',
    tournaments: 'chess tournament OR "chess championship" OR FIDE',
    strategy: 'chess strategy OR "chess opening" OR "chess tactics" OR "chess endgame"'
};

export const getNewsByTopic = async (topic) => {
    try {
        const query = TOPIC_QUERIES[topic.toLowerCase()] || TOPIC_QUERIES.general;

        // Get articles from the last 30 days, sorted by relevance
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const fromDate = thirtyDaysAgo.toISOString().split('T')[0];

        const url = `${NEWS_API_BASE_URL}?q=${encodeURIComponent(query)}&from=${fromDate}&sortBy=relevancy&pageSize=10&apiKey=${NEWS_API_KEY}`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error(`News API error: ${response.status}`);
        }

        const data = await response.json();

        // Transform News API response to our format
        return data.articles.map((article, index) => ({
            id: index + 1,
            title: article.title,
            summary: article.description || article.content?.substring(0, 200) || 'No description available',
            date: new Date(article.publishedAt).toISOString().split('T')[0],
            source: article.source.name,
            url: article.url,
            image: article.urlToImage
        }));
    } catch (error) {
        console.error('News API Error:', error);

        // Return fallback mock data on error
        return [
            {
                id: 1,
                title: "Unable to fetch news",
                summary: "There was an error fetching the latest chess news. Please try again later.",
                date: new Date().toISOString().split('T')[0],
                source: "System"
            }
        ];
    }
};

export const searchAI = async (query) => {
    try {
        const response = await fetch('http://localhost:3001/api/ai-search', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ query }),
        });

        if (!response.ok) {
            throw new Error('Search failed');
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('AI Search Error:', error);
        return { text: 'Failed to connect to AI service.', source: 'error' };
    }
};
