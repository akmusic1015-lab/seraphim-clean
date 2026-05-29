const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("clearwarns")
        .setDescription("Clear warnings")
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        ),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "No permission", flags: 64 });

        const user = interaction.options.getUser("user");

        client.modLog(interaction.guild, "CLEAR WARNS", user.tag, interaction.user.tag);

        const embed = new EmbedBuilder()
            .setColor(0x00ff99)
            .setDescription(`🧹 Cleared warnings for ${user.tag}`);

        interaction.reply({ embeds: [embed] });
    }
};