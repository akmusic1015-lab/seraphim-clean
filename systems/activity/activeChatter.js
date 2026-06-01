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

        let given = 0;
        let removed = 0;

        for (const guild of client.guilds.cache.values()) {

            const role =
                guild.roles.cache.get(ROLE_ID);

            if (!role) continue;

            for (const member of guild.members.cache.values()) {

                if (member.user.bot) continue;

                const user = db.prepare(`
                    SELECT weeklyMessages
                    FROM users
                    WHERE userId = ?
                `).get(member.id);

                if (!user) continue;

                // =========================
                // GIVE ROLE
                // =========================

                if (
                    user.weeklyMessages >=
                    REQUIRED_MESSAGES
                ) {

                    if (
                        !member.roles.cache.has(
                            ROLE_ID
                        )
                    ) {

                        await member.roles
                            .add(ROLE_ID)
                            .catch(() => {});

                        given++;

                        console.log(
                            `🔥 Active Chatter → ${member.user.tag}`
                        );
                    }
                }

                // =========================
                // REMOVE ROLE
                // =========================

                else {

                    if (
                        member.roles.cache.has(
                            ROLE_ID
                        )
                    ) {

                        await member.roles
                            .remove(ROLE_ID)
                            .catch(() => {});

                        removed++;

                        console.log(
                            `💤 Removed Active Chatter → ${member.user.tag}`
                        );
                    }
                }
            }
        }

        if (given > 0 || removed > 0) {

            console.log(
                `📊 Active Chatter Update | Added: ${given} | Removed: ${removed}`
            );
        }

    }, 1000 * 60 * 10);

};