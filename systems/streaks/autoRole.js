const db = require("../../database/database");

const TOP_ROLE_ID = "1509103096343822467";

async function updateTopStreakRole(client) {

    const top = db.prepare(`
        SELECT userId, messageStreak, recordStreak, everTop
        FROM users
        ORDER BY messageStreak DESC
        LIMIT 1
    `).get();

    if (!top) return;

    const {
        userId,
        messageStreak,
        recordStreak,
        everTop
    } = top;

    for (const guild of client.guilds.cache.values()) {

        const role =
            guild.roles.cache.get(TOP_ROLE_ID);

        if (!role) continue;

        await guild.members.fetch()
            .catch(() => null);

        // =========================
        // FIND CURRENT HOLDER
        // =========================

        const currentHolder =
            guild.members.cache.find(
                member =>
                    member.roles.cache.has(
                        TOP_ROLE_ID
                    )
            );

        // already correct holder
        if (
            currentHolder &&
            currentHolder.id === userId
        ) {
            continue;
        }

        // =========================
        // REMOVE OLD HOLDER
        // =========================

        if (currentHolder) {

            await currentHolder.roles
                .remove(TOP_ROLE_ID)
                .catch(() => {});
        }

        // =========================
        // GIVE NEW HOLDER
        // =========================

        const member =
            await guild.members
                .fetch(userId)
                .catch(() => null);

        if (!member) continue;

        await member.roles
            .add(TOP_ROLE_ID)
            .catch(() => {});

        // =========================
        // FIRST TIME #1
        // =========================

        const isFirstTime = !everTop;

        if (isFirstTime) {

            db.prepare(`
                UPDATE users
                SET everTop = 1
                WHERE userId = ?
            `).run(userId);
        }

        // =========================
        // RECORD CHECK
        // =========================

        const recordRow = db.prepare(`
            SELECT MAX(recordStreak) as maxRecord
            FROM users
        `).get();

        const currentRecord =
            recordRow?.maxRecord || 0;

        const isNewRecord =
            messageStreak > currentRecord;

        if (isNewRecord) {

            db.prepare(`
                UPDATE users
                SET recordStreak = ?
                WHERE userId = ?
            `).run(
                messageStreak,
                userId
            );
        }

        // =========================
        // ANNOUNCEMENT
        // =========================

        const channel =
            guild.channels.cache.find(
                c => c.name === "general"
            );

        if (!channel) continue;

        let msg =
            `👑 <@${userId}> is now **#1 in streaks!**\n` +
            `🔥 Current streak: **${messageStreak} days**\n` +
            `🎖️ Awarded <@&${TOP_ROLE_ID}>`;

        if (isFirstTime) {
            msg +=
                `\n✨ **FIRST TIME EVER #1!**`;
        }

        if (isNewRecord) {
            msg +=
                `\n🏆 **NEW RECORD STREAK!**`;
        }

        await channel.send(msg)
            .catch(() => {});

        console.log(
            `👑 Top streak role updated → ${member.user.tag}`
        );
    }
}

module.exports = {
    updateTopStreakRole
};