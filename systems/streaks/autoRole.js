const db = require("../../database/database");

const TOP_ROLE_ID = "1509103096343822467";

async function updateTopStreakRole(client) {

    const top = db.prepare(`
        SELECT userId, messageStreak, everTop
        FROM users
        ORDER BY messageStreak DESC
        LIMIT 1
    `).get();

    if (!top) return;

    const { userId, messageStreak } = top;

    // =========================
    // GET GLOBAL RECORD
    // =========================
    const recordRow = db.prepare(`
        SELECT MAX(recordStreak) as maxRecord
        FROM users
    `).get();

    const currentRecord = recordRow?.maxRecord || 0;
    const isNewRecord = messageStreak > currentRecord;

    if (isNewRecord) {
        db.prepare(`
            UPDATE users
            SET recordStreak = ?
            WHERE userId = ?
        `).run(messageStreak, userId);
    }

    for (const guild of client.guilds.cache.values()) {

        const role = guild.roles.cache.get(TOP_ROLE_ID);
        if (!role) continue;

        await guild.members.fetch().catch(() => null);

        // remove role from everyone who has it
        guild.members.cache.forEach(m => {
            if (m.roles.cache.has(TOP_ROLE_ID)) {
                m.roles.remove(TOP_ROLE_ID).catch(() => {});
            }
        });

        const member = await guild.members.fetch(userId).catch(() => null);
        if (!member) continue;

        await member.roles.add(role).catch(() => {});

        const channel = guild.channels.cache.find(c => c.name === "general");
        if (!channel) continue;

        // =========================
        // FIRST TIME #1 CHECK
        // =========================
        const isFirstTime = !top.everTop;

        if (isFirstTime) {
            db.prepare(`
                UPDATE users
                SET everTop = 1
                WHERE userId = ?
            `).run(userId);
        }

        // =========================
        // MESSAGE BUILD
        // =========================

        let msg =
            `👑 <@${userId}> just took **#1 in streaks!**\n` +
            `🔥 Current streak: **${messageStreak} days**\n` +
            `🎖️ They have been given the <@&${TOP_ROLE_ID}> role!`;

        if (isFirstTime) {
            msg += `\n✨ **FIRST TIME EVER #1!**`;
        }

        if (isNewRecord) {
            msg += `\n🏆 **NEW RECORD STREAK!**`;
        }

        channel.send(msg).catch(() => {});
    }
}

module.exports = { updateTopStreakRole };