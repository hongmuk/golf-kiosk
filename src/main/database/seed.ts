import type Database from 'better-sqlite3';

export function seedDefaults(db: Database.Database): void {
  const insertSetting = db.prepare(
    `INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)`
  );

  const defaults: [string, string][] = [
    ['price_golf_ball', '5000'],
    ['price_sticker', '3000'],
    ['admin_password', '1234'],
    ['idle_timeout', '120'],
    ['complete_timeout', '10'],
    ['printer_name', ''],
    ['cutter_port', ''],
  ];

  const seedMany = db.transaction(() => {
    for (const [key, value] of defaults) {
      insertSetting.run(key, value);
    }
  });

  seedMany();
}
