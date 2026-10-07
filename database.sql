-- PostgreSQL Schema for 500-User Competitive Exam Platform

CREATE TABLE IF NOT EXISTS teams (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) UNIQUE NOT NULL,
    score INT DEFAULT 0,
    balance INT DEFAULT 0,
    wrong_attempts INT DEFAULT 0,
    is_locked BOOLEAN DEFAULT FALSE,
    lock_reason TEXT DEFAULT '',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS problems (
    id VARCHAR(10) PRIMARY KEY,
    key VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    diff VARCHAR(20) NOT NULL,
    pts INT NOT NULL,
    cat VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    constraints TEXT NOT NULL,
    sample_input TEXT NOT NULL,
    sample_output TEXT NOT NULL
);

-- Hidden tests are stored in a separate table, NEVER queried or returned by the client API
CREATE TABLE IF NOT EXISTS hidden_tests (
    id SERIAL PRIMARY KEY,
    problem_id VARCHAR(10) REFERENCES problems(id) ON DELETE CASCADE,
    input_data TEXT NOT NULL,
    expected_output TEXT NOT NULL,
    test_order INT DEFAULT 1
);

CREATE TABLE IF NOT EXISTS team_unlocked_problems (
    team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
    problem_id VARCHAR(10) REFERENCES problems(id) ON DELETE CASCADE,
    unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (team_id, problem_id)
);

CREATE TABLE IF NOT EXISTS submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    team_name VARCHAR(100) NOT NULL,
    problem_id VARCHAR(10) NOT NULL,
    lang VARCHAR(20) NOT NULL,
    code TEXT NOT NULL,
    status VARCHAR(30) DEFAULT 'QUEUED', -- QUEUED, RUNNING, ACCEPTED, WRONG_ANSWER, TLE, CE
    points_awarded INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS telemetry_events (
    id BIGSERIAL PRIMARY KEY,
    team_name VARCHAR(100) NOT NULL,
    event VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Performance Indexes for 500-User Real-time Queries
CREATE INDEX IF NOT EXISTS idx_submissions_team ON submissions(team_name);
CREATE INDEX IF NOT EXISTS idx_submissions_created_at ON submissions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_telemetry_team ON telemetry_events(team_name);
CREATE INDEX IF NOT EXISTS idx_telemetry_created_at ON telemetry_events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_teams_score ON teams(score DESC, wrong_attempts ASC);
