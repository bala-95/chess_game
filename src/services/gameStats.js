import { supabase } from '../lib/supabase';

export const gameStats = {
    // Save a game result
    async saveGameResult(userId, result, opponent = 'AI') {
        try {
            const { data, error } = await supabase
                .from('game_results')
                .insert([
                    {
                        user_id: userId,
                        result,
                        opponent,
                        game_mode: opponent === 'AI' ? 'PvAI' : 'PvP'
                    }
                ]);

            if (error) throw error;
            return { success: true, data };
        } catch (error) {
            console.error('Error saving game result:', error);
            return { success: false, error: error.message };
        }
    },

    // Get user statistics
    async getUserStats(userId) {
        try {
            const { data, error } = await supabase
                .from('game_results')
                .select('result, opponent')
                .eq('user_id', userId);

            if (error) throw error;

            // Calculate stats
            const stats = {
                total: data.length,
                wins: data.filter(g => g.result === 'win').length,
                losses: data.filter(g => g.result === 'loss').length,
                draws: data.filter(g => g.result === 'draw').length,
                vsAI: {
                    total: data.filter(g => g.opponent === 'AI').length,
                    wins: data.filter(g => g.opponent === 'AI' && g.result === 'win').length,
                    losses: data.filter(g => g.opponent === 'AI' && g.result === 'loss').length,
                    draws: data.filter(g => g.opponent === 'AI' && g.result === 'draw').length,
                },
                vsHuman: {
                    total: data.filter(g => g.opponent === 'Human').length,
                    wins: data.filter(g => g.opponent === 'Human' && g.result === 'win').length,
                    losses: data.filter(g => g.opponent === 'Human' && g.result === 'loss').length,
                    draws: data.filter(g => g.opponent === 'Human' && g.result === 'draw').length,
                }
            };

            return { success: true, stats };
        } catch (error) {
            console.error('Error fetching user stats:', error);
            return { success: false, error: error.message };
        }
    },

    // Get recent games
    async getRecentGames(userId, limit = 10) {
        try {
            const { data, error } = await supabase
                .from('game_results')
                .select('*')
                .eq('user_id', userId)
                .order('created_at', { ascending: false })
                .limit(limit);

            if (error) throw error;
            return { success: true, games: data };
        } catch (error) {
            console.error('Error fetching recent games:', error);
            return { success: false, error: error.message };
        }
    }
};
