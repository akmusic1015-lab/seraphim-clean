const db = require("../../database/database");
const getUser = require("./getUser");

module.exports = async (message) => {

    if (!message.guild) return;
    if (message.author.bot) return;

    // Ensure user exists
    getUser(message.author.id);

    db.prepare(`
        UPDATE users
        SET
            totalMessages = totalMessages + 1,
            weeklyMessages = weeklyMessages + 1
        WHERE userId = ?
    `).run(message.author.id);
};