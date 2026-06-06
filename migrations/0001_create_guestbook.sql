CREATE TABLE IF NOT EXISTS guestbook (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  name TEXT NOT NULL,
  content TEXT NOT NULL,
  password_salt TEXT NOT NULL,
  password_hash TEXT NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_guestbook_timestamp ON guestbook (timestamp DESC);
