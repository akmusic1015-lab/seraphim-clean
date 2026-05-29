const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("slowmode")
        .setDescription("Set channel slowmode")
        .addIntegerOption(o =>
            o.setName("seconds")
                .setDescription("Slowmode delay in seconds")
                .setRequired(true)
        ),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ No permission.", flags: 64 });
        }

        const seconds = interaction.options.getInteger("seconds");

        await interaction.channel.setRateLimitPerUser(seconds);

        const embed = new EmbedBuilder()
            .setColor(0xfaa61a)
            .setDescription(`🐢 Slowmode set to **${seconds}s**.`);

        interaction.reply({ embeds: [embed] });
    }
};