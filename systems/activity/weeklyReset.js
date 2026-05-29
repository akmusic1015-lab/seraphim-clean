const db = require("../../database/database");

module.exports = () => {

    // every 7 days
    setInterval(() => {

        console.log(
            "🔄 Resetting weekly activity..."
        );

        db.prepare(`
            UPDATE users
            SET
                weeklyMessages = 0,
                weeklyVcMinutes = 0
        `).run();

    }, 1000 * 60 * 60 * 24 * 7);

};