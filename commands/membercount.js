const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("membercount")
        .setDescription("Show member count"),

    async execute(i) {
        i.reply(`👥 Members: ${i.guild.memberCount}`);
    }
};