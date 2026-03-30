import type Database from 'better-sqlite3';

export function runMigrations(db: Database.Database): void {
  db.exec(`
    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_type TEXT NOT NULL CHECK(product_type IN ('golf_ball', 'sticker')),
      design_data TEXT NOT NULL DEFAULT '{}',
      amount INTEGER NOT NULL DEFAULT 0,
      payment_status TEXT NOT NULL DEFAULT 'pending'
        CHECK(payment_status IN ('pending', 'completed', 'failed', 'refunded')),
      payment_method TEXT DEFAULT 'card',
      kicc_transaction_id TEXT,
      kicc_approval_no TEXT,
      print_status TEXT NOT NULL DEFAULT 'pending'
        CHECK(print_status IN ('pending', 'printing', 'completed', 'failed')),
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime')),
      completed_at TEXT
    );

    CREATE TABLE IF NOT EXISTS print_logs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL REFERENCES orders(id),
      status TEXT NOT NULL CHECK(status IN ('started', 'completed', 'error')),
      message TEXT,
      created_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT NOT NULL,
      updated_at TEXT NOT NULL DEFAULT (datetime('now', 'localtime'))
    );

    CREATE TABLE IF NOT EXISTS characters (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      category TEXT NOT NULL DEFAULT 'general',
      image_path TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS fonts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      file_path TEXT NOT NULL,
      is_active INTEGER NOT NULL DEFAULT 1,
      sort_order INTEGER NOT NULL DEFAULT 0
    );
  `);
}
