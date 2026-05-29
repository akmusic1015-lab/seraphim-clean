const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("topmessages")
        .setDescription("View the top message leaderboard"),

    async execute(interaction) {

        const users = db.prepare(`
            SELECT *
            FROM users
            ORDER BY messages DESC
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

            description +=
                `**${i + 1}.** ${username} — ` +
                `💬 ${userData.messages.toLocaleString()}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle("💬 Top Messages")
            .setColor(0x2b2d31)
            .setDescription(description);

        await interaction.reply({
            embeds: [embed]
        });
    }
};