const { SlashCommandBuilder } = require("discord.js");

const jokes = [
    "Why do programmers hate nature? Too many bugs.",
    "I told my PC to take a break… it froze.",
    "Discord moderation = emotional damage simulator."
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("joke")
        .setDescription("Get a joke"),

    async execute(interaction) {
        const joke = jokes[Math.floor(Math.random() * jokes.length)];
        interaction.reply(`😂 ${joke}`);
    }
};