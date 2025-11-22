export const getNewsByTopic = async (topic) => {
    try {
        // Use relative path that works in both local and production
        const response = await fetch(`/api/news?topic=${encodeURIComponent(topic)}`);

        if (!response.ok) {
            throw new Error(`News API error: ${response.status}`);
        }

        return await response.json();
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
        // Use relative path that works in both local and production
        const response = await fetch('/api/ai-search', {
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
