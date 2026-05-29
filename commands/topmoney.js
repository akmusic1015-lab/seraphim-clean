const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("topmoney")
        .setDescription("View the richest users"),

    async execute(interaction) {

        const users = db.prepare(`
            SELECT *,
            (wallet + bank) AS totalMoney
            FROM users
            ORDER BY totalMoney DESC
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
                `🪙 ${userData.totalMoney.toLocaleString()}\n`;
        }

        const embed = new EmbedBuilder()
            .setTitle("💰 Top Money")
            .setColor(0x2b2d31)
            .setDescription(description);

        await interaction.reply({
            embeds: [embed]
        });
    }
};