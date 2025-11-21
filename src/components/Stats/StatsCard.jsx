import React, { useEffect, useState } from 'react';
import { Trophy, Target, TrendingUp } from 'lucide-react';
import { gameStats } from '../../services/gameStats';
import { useAuth } from '../../contexts/AuthContext';
import './StatsCard.css';

export const StatsCard = () => {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (!user) return;

        let mounted = true;

        const loadStats = async () => {
            setLoading(true);
            const result = await gameStats.getUserStats(user.id);
            if (mounted && result.success) {
                setStats(result.stats);
            }
            if (mounted) {
                setLoading(false);
            }
        };

        loadStats();

        return () => {
            mounted = false;
        };
    }, [user]);

    if (loading) {
        return (
            <div className="stats-card">
                <h3>Statistics</h3>
                <p>Loading...</p>
            </div>
        );
    }

    if (!stats || stats.total === 0) {
        return (
            <div className="stats-card">
                <h3>Statistics</h3>
                <p className="no-stats">No games played yet!</p>
            </div>
        );
    }

    const winRate = stats.total > 0 ? ((stats.wins / stats.total) * 100).toFixed(1) : 0;

    return (
        <div className="stats-card">
            <h3><Trophy size={20} /> Statistics</h3>

            <div className="stats-grid">
                <div className="stat-item win">
                    <div className="stat-value">{stats.wins}</div>
                    <div className="stat-label">Wins</div>
                </div>
                <div className="stat-item loss">
                    <div className="stat-value">{stats.losses}</div>
                    <div className="stat-label">Losses</div>
                </div>
                <div className="stat-item draw">
                    <div className="stat-value">{stats.draws}</div>
                    <div className="stat-label">Draws</div>
                </div>
            </div>

            <div className="win-rate">
                <TrendingUp size={16} />
                <span>Win Rate: {winRate}%</span>
            </div>

            <div className="stats-breakdown">
                <div className="breakdown-section">
                    <Target size={14} />
                    <span className="breakdown-label">vs AI:</span>
                    <span className="breakdown-value">
                        {stats.vsAI.wins}W - {stats.vsAI.losses}L - {stats.vsAI.draws}D
                    </span>
                </div>
                {stats.vsHuman.total > 0 && (
                    <div className="breakdown-section">
                        <Target size={14} />
                        <span className="breakdown-label">vs Human:</span>
                        <span className="breakdown-value">
                            {stats.vsHuman.wins}W - {stats.vsHuman.losses}L - {stats.vsHuman.draws}D
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};
