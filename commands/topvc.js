const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("topvc")
        .setDescription("View the top VC leaderboard"),

    async execute(interaction) {

        const users = db.prepare(`
            SELECT *
            FROM users
            ORDER BY vcMinutes DESC
            LIMIT 10
        `).all();

        if (!users.length) {
            return interaction.reply({
                content: "❌ No data found."
            });
        }

        let description = "";

        for (let i = 0; i < users.length; i++) {

            const userData = users[i];

            const member =
                await interaction.client.users
                    .fetch(userData.userId)
                    .catch(() => null);

            const username =
                member?.username || "Unknown User";

            const hours = Math.floor(userData.vcMinutes / 60);
            const minutes = userData.vcMinutes % 60;

            description +=
                `**${i + 1}.** ${username} — ` +
                `🎤 ${hours}h ${minutes}m\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle("🎤 Top VC")
            .setColor(0x2b2d31)
            .setDescription(description);

        await interaction.reply({
            embeds: [embed]
        });
    }
};