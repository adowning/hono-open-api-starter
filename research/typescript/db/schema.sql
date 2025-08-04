-- Main table for game definitions
CREATE TABLE games (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) UNIQUE NOT NULL,
    provider VARCHAR(50) NOT NULL,
    reel_width INT NOT NULL DEFAULT 5,
    reel_height INT NOT NULL DEFAULT 3,
    bonus_handler_key VARCHAR(50)
);

-- Users table for authentication and balance
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    balance NUMERIC(12, 2) NOT NULL DEFAULT 1000.00,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Paylines for each game
CREATE TABLE paylines (
    id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    line_number INT NOT NULL,
    positions JSONB NOT NULL,
    UNIQUE(game_id, line_number)
);

-- Payouts for winning combinations
CREATE TABLE pay_tables (
    id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    symbol_id INT NOT NULL,
    matches INT NOT NULL,
    payout_multiplier NUMERIC(10, 4) NOT NULL,
    is_scatter BOOLEAN DEFAULT FALSE,
    free_spins_awarded INT DEFAULT 0
);

-- A collection of reel strips for a specific RTP
CREATE TABLE reel_sets (
    id SERIAL PRIMARY KEY,
    game_id INT REFERENCES games(id) ON DELETE CASCADE,
    rtp_percent NUMERIC(7, 4) NOT NULL,
    UNIQUE(game_id, rtp_percent)
);

-- The actual reel strips for a given reel_set
CREATE TABLE reel_strips (
    id SERIAL PRIMARY KEY,
    reel_set_id INT REFERENCES reel_sets(id) ON DELETE CASCADE,
    reel_index INT NOT NULL,
    strip_data INT[] NOT NULL
);