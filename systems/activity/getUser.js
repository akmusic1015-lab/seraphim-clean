const db = require("../../database/database");

module.exports = (userId) => {

    let user = db.prepare(`
        SELECT *
        FROM users
        WHERE userId = ?
    `).get(userId);

    if (!user) {

        db.prepare(`
            INSERT INTO users (
                userId
            )
            VALUES (?)
        `).run(userId);

        user = {
            userId,
            wallet: 0,
            bank: 0,
            messages: 0,
            vcMinutes: 0,
            chatStreak: 0,
            vcStreak: 0,
            lastMessageDate: null,
            messageStreak: 0,
            weeklyMessages: 0,
            totalMessages: 0,
            weeklyVcMinutes: 0,
            totalVcMinutes: 0,
            dailyCooldown: 0,
            workCooldown: 0,
            recordStreak: 0,
            everTop: 0
        };

        console.log(
            `👤 Created user: ${userId}`
        );
    }

    return user;
};