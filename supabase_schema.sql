-- Run this SQL in your Supabase SQL Editor to create the game_results table

-- Create game_results table
CREATE TABLE IF NOT EXISTS game_results (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    result TEXT NOT NULL CHECK (result IN ('win', 'loss', 'draw')),
    opponent TEXT NOT NULL CHECK (opponent IN ('AI', 'Human')),
    game_mode TEXT DEFAULT 'PvAI',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE game_results ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own game results
CREATE POLICY "Users can view own game results"
    ON game_results
    FOR SELECT
    USING (auth.uid() = user_id);

-- Create policy: Users can only insert their own game results
CREATE POLICY "Users can insert own game results"
    ON game_results
    FOR INSERT
    WITH CHECK (auth.uid() = user_id);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS game_results_user_id_idx ON game_results(user_id);
CREATE INDEX IF NOT EXISTS game_results_created_at_idx ON game_results(created_at DESC);
