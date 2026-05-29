const db = require("../../database/database");

module.exports = (userId) => {

    let user = db.prepare(`
        SELECT *
        FROM users
        WHERE userId = ?
    `).get(userId);

    // create user if missing
    if (!user) {

        db.prepare(`
            INSERT INTO users (
                userId
            )
            VALUES (?)
        `).run(userId);

        user = db.prepare(`
            SELECT *
            FROM users
            WHERE userId = ?
        `).get(userId);
    }

    return user;
};