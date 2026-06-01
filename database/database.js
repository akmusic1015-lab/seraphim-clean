const path = require("path");
const Database = require("better-sqlite3");

const db = new Database(
    path.join(__dirname, "seraphim.db")
);

// =========================
// USERS
// =========================

db.prepare(`
CREATE TABLE IF NOT EXISTS users (
    userId TEXT PRIMARY KEY,
    wallet INTEGER DEFAULT 0,
    bank INTEGER DEFAULT 0,
    messages INTEGER DEFAULT 0,
    vcMinutes INTEGER DEFAULT 0,
    chatStreak INTEGER DEFAULT 0,
    vcStreak INTEGER DEFAULT 0,
    lastMessageDate TEXT,
    messageStreak INTEGER DEFAULT 0,
    weeklyMessages INTEGER DEFAULT 0,
    totalMessages INTEGER DEFAULT 0,
    weeklyVcMinutes INTEGER DEFAULT 0,
    totalVcMinutes INTEGER DEFAULT 0,
    dailyCooldown INTEGER DEFAULT 0,
    workCooldown INTEGER DEFAULT 0,
    recordStreak INTEGER DEFAULT 0,
    everTop INTEGER DEFAULT 0
);
`).run();

// =========================
// TREE (WORLD STATE)
// =========================

db.prepare(`
CREATE TABLE IF NOT EXISTS tree (
    id INTEGER PRIMARY KEY,
    level INTEGER DEFAULT 1,
    xp INTEGER DEFAULT 0,
    nextLevelXp INTEGER DEFAULT 100,
    water INTEGER DEFAULT 0,
    weather TEXT DEFAULT 'clear'
);
`).run();

// ensure single row

const exists = db.prepare(`
    SELECT id
    FROM tree
    WHERE id = 1
`).get();

if (!exists) {

    db.prepare(`
        INSERT INTO tree (
            id,
            level,
            xp,
            nextLevelXp,
            water,
            weather
        )
        VALUES (
            1,
            1,
            0,
            100,
            0,
            'clear'
        )
    `).run();
}

// =========================
// CONTRIBUTORS
// =========================

db.prepare(`
CREATE TABLE IF NOT EXISTS tree_contributors (
    userId TEXT PRIMARY KEY,
    xp INTEGER DEFAULT 0,
    water INTEGER DEFAULT 0
);
`).run();

// =========================
// STREAK HISTORY
// =========================

db.prepare(`
CREATE TABLE IF NOT EXISTS streak_history (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    streak INTEGER,
    timestamp INTEGER
);
`).run();

// =========================
// SETTINGS
// =========================

db.prepare(`
CREATE TABLE IF NOT EXISTS settings (
    key TEXT PRIMARY KEY,
    value TEXT
);
`).run();

// =========================
// STARTUP
// =========================

console.log("✅ Database Connected");

module.exports = db;