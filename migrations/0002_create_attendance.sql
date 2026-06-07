CREATE TABLE IF NOT EXISTS attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  timestamp INTEGER NOT NULL,
  side TEXT NOT NULL,
  name TEXT NOT NULL,
  meal TEXT NOT NULL,
  attendee_count INTEGER NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_attendance_timestamp ON attendance (timestamp DESC);
