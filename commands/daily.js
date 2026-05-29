const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("daily")
        .setDescription("Claim your daily reward"),

    async execute(interaction) {

        const user = getUser(interaction.user.id);

        const now = Date.now();

        const cooldown = 24 * 60 * 60 * 1000;

        // cooldown check
        if (now < user.dailyCooldown) {

            const remaining = user.dailyCooldown - now;

            const hours = Math.floor(
                remaining / (1000 * 60 * 60)
            );

            const minutes = Math.floor(
                (remaining % (1000 * 60 * 60))
                / (1000 * 60)
            );

            return interaction.reply({
                content:
                    `⏳ You already claimed daily.\n` +
                    `Try again in ${hours}h ${minutes}m`,
                flags: 64
            });
        }

        const reward = 1000;

        db.prepare(`
            UPDATE users
            SET
                wallet = wallet + ?,
                dailyCooldown = ?
            WHERE userId = ?
        `).run(
            reward,
            now + cooldown,
            interaction.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("🎁 Daily Reward")
            .setColor(0x2b2d31)
            .setDescription(
                `You received 🪙 ${reward.toLocaleString()}`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};