import React, { useState, useEffect } from 'react';
import { X, Search, Newspaper, MessageSquare } from 'lucide-react';
import { getNewsByTopic, searchAI } from '../../services/newsService';
import './NewsPane.css';

export function NewsPane({ isOpen, onClose }) {
    const [activeTab, setActiveTab] = useState('news'); // 'news' or 'search'
    const [newsTopic, setNewsTopic] = useState('general');
    const [newsItems, setNewsItems] = useState([]);
    const [loadingNews, setLoadingNews] = useState(false);

    const [searchQuery, setSearchQuery] = useState('');
    const [searchResult, setSearchResult] = useState(null);
    const [isSearching, setIsSearching] = useState(false);

    useEffect(() => {
        if (isOpen && activeTab === 'news') {
            loadNews();
        }
    }, [isOpen, activeTab, newsTopic]);

    const loadNews = async () => {
        setLoadingNews(true);
        try {
            const items = await getNewsByTopic(newsTopic);
            setNewsItems(items);
        } catch (error) {
            console.error('Failed to load news', error);
        } finally {
            setLoadingNews(false);
        }
    };

    const handleSearch = async (e) => {
        e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        setSearchResult(null);
        try {
            const result = await searchAI(searchQuery);
            setSearchResult(result);
        } catch (error) {
            setSearchResult({ text: 'Error performing search.', source: 'error' });
        } finally {
            setIsSearching(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className={`news-pane ${isOpen ? 'open' : ''}`}>
            <div className="news-pane-header">
                <h2>Chess Assistant</h2>
                <button onClick={onClose} className="close-button">
                    <X size={24} />
                </button>
            </div>

            <div className="news-pane-tabs">
                <button
                    className={activeTab === 'news' ? 'active' : ''}
                    onClick={() => setActiveTab('news')}
                >
                    <Newspaper size={18} /> News
                </button>
                <button
                    className={activeTab === 'search' ? 'active' : ''}
                    onClick={() => setActiveTab('search')}
                >
                    <Search size={18} /> AI Search
                </button>
            </div>

            <div className="news-pane-content">
                {activeTab === 'news' && (
                    <div className="news-section">
                        <div className="topic-selector">
                            <select value={newsTopic} onChange={(e) => setNewsTopic(e.target.value)}>
                                <option value="general">General News</option>
                                <option value="tournaments">Tournaments</option>
                                <option value="strategy">Strategy</option>
                            </select>
                        </div>

                        {loadingNews ? (
                            <div className="loading-spinner">Loading news...</div>
                        ) : (
                            <div className="news-list">
                                {newsItems.map(item => (
                                    <div key={item.id} className="news-item">
                                        <h3>{item.title}</h3>
                                        <p>{item.summary}</p>
                                        <div className="news-meta">
                                            <span>{item.source}</span>
                                            <span>{item.date}</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'search' && (
                    <div className="search-section">
                        <form onSubmit={handleSearch} className="search-form">
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                placeholder="Ask about chess..."
                            />
                            <button type="submit" disabled={isSearching}>
                                {isSearching ? '...' : <MessageSquare size={18} />}
                            </button>
                        </form>

                        {searchResult && (
                            <div className="search-result">
                                <h3>AI Response:</h3>
                                <div className="result-content">
                                    {searchResult.text}
                                </div>
                                {searchResult.source && (
                                    <div className="result-source">Source: {searchResult.source}</div>
                                )}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
