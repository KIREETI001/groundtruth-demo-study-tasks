-- Each row represents one study task.
CREATE TABLE IF NOT EXISTS tasks (
  id INTEGER PRIMARY KEY,
  title TEXT NOT NULL CHECK(length(title) BETWEEN 1 AND 80),
  completed INTEGER NOT NULL DEFAULT 0 CHECK(completed IN (0, 1))
);
