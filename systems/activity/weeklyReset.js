const db = require("../../database/database");

module.exports = () => {

    let lastResetDate = null;

    setInterval(() => {

        const now = new Date(
            new Date().toLocaleString(
                "en-US",
                {
                    timeZone: "Australia/Brisbane"
                }
            )
        );

        const day = now.getDay(); // Monday = 1
        const hour = now.getHours();
        const minute = now.getMinutes();

        const today =
            now.toISOString().split("T")[0];

        if (
            day === 1 &&
            hour === 0 &&
            minute === 0 &&
            lastResetDate !== today
        ) {

            console.log(
                "🔄 Resetting weekly activity..."
            );

            db.prepare(`
                UPDATE users
                SET
                    weeklyMessages = 0,
                    weeklyVcMinutes = 0
            `).run();

            lastResetDate = today;
        }

    }, 60000);

};