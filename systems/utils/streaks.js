const db = require("../../database/database");

const DAY = 1000 * 60 * 60 * 24;

function handleDailyStreak(userId) {

    const user = db.prepare(`
        SELECT messageStreak, recordStreak, lastMessageDate
        FROM users
        WHERE userId = ?
    `).get(userId);

    const now = Date.now();

    if (!user) {
        db.prepare(`
            INSERT INTO users (userId, messageStreak, recordStreak, lastMessageDate)
            VALUES (?, 1, 1, ?)
        `).run(userId, now);
        return;
    }

    const last = Number(user.lastMessageDate || 0);

    // ❌ same day = do nothing
    if (now - last < DAY) return;

    let newStreak;

    // ✔ within 48h = continue streak
    if (now - last < DAY * 2) {
        newStreak = (user.messageStreak || 0) + 1;
    } else {
        newStreak = 1;
    }

    const newBest = Math.max(user.recordStreak || 0, newStreak);

    db.prepare(`
        UPDATE users
        SET messageStreak = ?,
            recordStreak = ?,
            lastMessageDate = ?
        WHERE userId = ?
    `).run(newStreak, newBest, now, userId);
}

function getUserStreak(userId) {
    return db.prepare(`
        SELECT messageStreak, recordStreak
        FROM users
        WHERE userId = ?
    `).get(userId);
}

module.exports = {
    handleDailyStreak,
    getUserStreak
};