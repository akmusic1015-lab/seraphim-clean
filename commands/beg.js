const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

const responses = [
    "A stranger felt bad for you 😭",
    "Someone donated coins 💰",
    "You found money on the sidewalk 🪙",
    "An old man gave you allowance 👴"
];

module.exports = {

    data: new SlashCommandBuilder()
        .setName("beg")
        .setDescription("Beg for money"),

    async execute(interaction) {

        getUser(interaction.user.id);

        const reward = Math.floor(
            Math.random() * 201
        ) + 50;

        const response = responses[
            Math.floor(Math.random() * responses.length)
        ];

        db.prepare(`
            UPDATE users
            SET wallet = wallet + ?
            WHERE userId = ?
        `).run(
            reward,
            interaction.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("🙏 Beg")
            .setColor(0x2b2d31)
            .setDescription(
                `${response}\n\n` +
                `You received 🪙 ${reward.toLocaleString()}`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};