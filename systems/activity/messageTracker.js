const db = require("../../database/database");
const getUser = require("./getUser");

module.exports = async (message) => {

    if (!message.guild) return;
    if (message.author.bot) return;

    const user = getUser(message.author.id);

    const today =
        new Date().toISOString().split("T")[0];

    let streak = user.messageStreak;

    // streak system
    if (user.lastMessageDate) {

        const lastDate =
            new Date(user.lastMessageDate);

        const currentDate =
            new Date(today);

        const diff =
            Math.floor(
                (currentDate - lastDate)
                / (1000 * 60 * 60 * 24)
            );

        if (diff === 1) {
            streak++;
        }

        else if (diff > 1) {
            streak = 1;
        }

    } else {
        streak = 1;
    }

    db.prepare(`
        UPDATE users
        SET
            totalMessages = totalMessages + 1,
            weeklyMessages = weeklyMessages + 1,
            messageStreak = ?,
            lastMessageDate = ?
        WHERE userId = ?
    `).run(
        streak,
        today,
        message.author.id
    );
};