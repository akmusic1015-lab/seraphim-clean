const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("serverinfo")
        .setDescription("Get server info"),

    async execute(interaction) {

        const guild = interaction.guild;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🏠 Server Info")
            .addFields(
                { name: "Name", value: guild.name },
                { name: "Members", value: `${guild.memberCount}` }
            );

        interaction.reply({ embeds: [embed] });
    }
};