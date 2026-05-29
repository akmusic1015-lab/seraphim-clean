const { SlashCommandBuilder } = require("discord.js");

const truths = [
    "You opened Discord to avoid responsibilities.",
    "You are procrastinating right now.",
    "You have unfinished tasks right now."
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("truth")
        .setDescription("Get a truth"),

    async execute(interaction) {
        const truth = truths[Math.floor(Math.random() * truths.length)];
        interaction.reply(`🧠 ${truth}`);
    }
};