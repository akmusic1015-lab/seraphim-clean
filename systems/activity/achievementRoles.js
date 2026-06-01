const db = require("../../database/database");

module.exports = (client) => {

    // =========================
    // ACHIEVEMENTS
    // =========================

    const achievements = [

        // =========================
        // MESSAGE ACHIEVEMENTS
        // =========================

        {
            stat: "totalMessages",
            required: 100,
            roleId: "1508749187708096572"
        },

        {
            stat: "totalMessages",
            required: 500,
            roleId: "1508749724448985228"
        },

        {
            stat: "totalMessages",
            required: 2500,
            roleId: "1508749424724017223"
        },

        // =========================
        // VC ACHIEVEMENTS
        // =========================

        {
            stat: "totalVcMinutes",
            required: 300,
            roleId: "1508749618262048818"
        },

        {
            stat: "totalVcMinutes",
            required: 1200,
            roleId: "1508749373113368617"
        },

        {
            stat: "totalVcMinutes",
            required: 3000,
            roleId: "1508749822184657026"
        }

    ];

    // =========================
    // CHECK LOOP
    // =========================

    setInterval(async () => {

        for (const guild of client.guilds.cache.values()) {

            const members = guild.members.cache;

            for (const member of members.values()) {

                if (member.user.bot) continue;

                const user = db.prepare(`
                    SELECT *
                    FROM users
                    WHERE userId = ?
                `).get(member.id);

                if (!user) continue;

                for (const achievement of achievements) {

                    const current =
                        user[achievement.stat] || 0;

                    if (
                        current >= achievement.required &&
                        !member.roles.cache.has(
                            achievement.roleId
                        )
                    ) {

                        await member.roles
                            .add(achievement.roleId)
                            .catch(() => {});

                        console.log(
                            `🏆 ${member.user.tag} unlocked ${achievement.stat} (${achievement.required})`
                        );

                    }
                }
            }
        }

    }, 1000 * 60 * 5);

};