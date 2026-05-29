const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("countchannel")
        .setDescription("Enable counting in this channel"),

    async execute(interaction, client) {

        client.counting.set(interaction.channel.id, {
            nextNumber: 1,
            lastUser: null,
            streak: 0
        });

        const embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setDescription("🔢 Counting system **enabled** — starting at **1**");

        interaction.reply({ embeds: [embed] });
    }
};