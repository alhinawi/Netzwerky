-- Netzwerky: accounts, progress and leaderboard (D1)
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  email TEXT NOT NULL UNIQUE,
  name TEXT,
  picture TEXT,
  points INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE TABLE IF NOT EXISTS progress (
  user_id TEXT NOT NULL,
  book_id TEXT NOT NULL,
  page INTEGER NOT NULL,
  exercise_id TEXT NOT NULL,
  answer TEXT,
  correct INTEGER NOT NULL DEFAULT 0,
  updated_at TEXT NOT NULL DEFAULT (datetime('now')),
  PRIMARY KEY (user_id, book_id, page, exercise_id)
);

CREATE INDEX IF NOT EXISTS idx_progress_user ON progress(user_id, book_id);
CREATE INDEX IF NOT EXISTS idx_users_points ON users(points DESC);
