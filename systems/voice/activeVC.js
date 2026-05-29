const db = require("../../database/database");

module.exports = (client) => {

    // =========================
    // SETTINGS
    // =========================

    const ROLE_ID =
        "1494490300477866140";

    const REQUIRED_MINUTES = 300;

    // =========================
    // CHECK LOOP
    // =========================
    setInterval(async () => {

        for (const guild of client.guilds.cache.values()) {

            const role =
                guild.roles.cache.get(ROLE_ID);

            if (!role) continue;

            const members = guild.members.cache;

            for (const member of members.values()) {

                if (member.user.bot) continue;

                const user =
                    db.prepare(`
                        SELECT *
                        FROM users
                        WHERE userId = ?
                    `).get(member.id);

                if (!user) continue;

                // active
                if (
                    user.weeklyVcMinutes >=
                    REQUIRED_MINUTES
                ) {

                    if (
                        !member.roles.cache.has(
                            ROLE_ID
                        )
                    ) {

                        await member.roles.add(
                            ROLE_ID
                        ).catch(() => {});
                    }
                }

                // inactive
                else {

                    if (
                        member.roles.cache.has(
                            ROLE_ID
                        )
                    ) {

                        await member.roles.remove(
                            ROLE_ID
                        ).catch(() => {});
                    }
                }
            }
        }

    }, 1000 * 60 * 10);

};