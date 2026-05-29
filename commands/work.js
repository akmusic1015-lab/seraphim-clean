const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

const jobs = [
    "worked at a cafe ☕",
    "fixed someone's PC 💻",
    "edited videos 🎬",
    "moderated a server 🛡️",
    "streamed games 🎮",
    "did freelance art 🎨"
];

module.exports = {

    data: new SlashCommandBuilder()
        .setName("work")
        .setDescription("Work for some money"),

    async execute(interaction) {

        const user = getUser(interaction.user.id);

        const now = Date.now();

        const cooldown = 60 * 60 * 1000;

        if (now < user.workCooldown) {

            const remaining = user.workCooldown - now;

            const minutes = Math.floor(
                remaining / (1000 * 60)
            );

            return interaction.reply({
                content:
                    `⏳ You already worked recently.\n` +
                    `Try again in ${minutes} minutes.`,
                flags: 64
            });
        }

        const reward = Math.floor(
            Math.random() * 901
        ) + 100;

        const job = jobs[
            Math.floor(Math.random() * jobs.length)
        ];

        db.prepare(`
            UPDATE users
            SET
                wallet = wallet + ?,
                workCooldown = ?
            WHERE userId = ?
        `).run(
            reward,
            now + cooldown,
            interaction.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("💼 Work")
            .setColor(0x2b2d31)
            .setDescription(
                `${interaction.user} ${job}\n\n` +
                `Earned 🪙 ${reward.toLocaleString()}`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};