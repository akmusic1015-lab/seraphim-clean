const db = require("../../database/database");
const getUser = require("../activity/getUser");

module.exports = (client) => {

    // =========================
    // SETTINGS
    // =========================

    const COINS_PER_INTERVAL = 50;

    const INTERVAL_MINUTES = 5;

    // optional AFK channel
    const AFK_CHANNEL_ID = null;

    // =========================
    // LOOP
    // =========================
    setInterval(async () => {

        for (const guild of client.guilds.cache.values()) {

            const members = guild.members.cache;

            for (const member of members.values()) {

                if (member.user.bot) continue;

                const vc =
                    member.voice;

                // not in VC
                if (!vc.channelId)
                    continue;

                // AFK channel ignore
                if (
                    AFK_CHANNEL_ID &&
                    vc.channelId ===
                    AFK_CHANNEL_ID
                ) continue;

                // self deafened
                if (vc.selfDeaf)
                    continue;

                // self muted
                if (vc.selfMute)
                    continue;

                // create user
                getUser(member.id);

                // reward
                db.prepare(`
                    UPDATE users
                    SET
                        vcMinutes = vcMinutes + ?,
                        totalVcMinutes = totalVcMinutes + ?,
                        weeklyVcMinutes = weeklyVcMinutes + ?,
                        wallet = wallet + ?
                    WHERE userId = ?
                `).run(
                    INTERVAL_MINUTES,
                    INTERVAL_MINUTES,
                    INTERVAL_MINUTES,
                    COINS_PER_INTERVAL,
                    member.id
                );

                console.log(
                    `🎤 ${member.user.tag} earned ${COINS_PER_INTERVAL} coins`
                );
            }

        }

    }, 1000 * 60 * INTERVAL_MINUTES);

};