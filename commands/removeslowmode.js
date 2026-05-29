const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removeslowmode")
        .setDescription("Remove channel slowmode"),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ No permission.", flags: 64 });
        }

        await interaction.channel.setRateLimitPerUser(0);

        const embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setDescription("⚡ Slowmode has been **removed**.");

        interaction.reply({ embeds: [embed] });
    }
};