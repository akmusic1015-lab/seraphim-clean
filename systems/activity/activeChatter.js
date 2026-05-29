const db = require("../../database/database");

module.exports = (client) => {

    // =========================
    // SETTINGS
    // =========================

    const ROLE_ID =
        "1494490217757806602";

    const REQUIRED_MESSAGES = 100;

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
                    user.weeklyMessages >=
                    REQUIRED_MESSAGES
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