const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warn")
        .setDescription("Warn a user")
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        )
        .addStringOption(o =>
            o.setName("reason").setDescription("Reason").setRequired(false)
        ),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "No permission", flags: 64 });

        const user = interaction.options.getUser("user");
        const reason = interaction.options.getString("reason") || "No reason provided";

        client.modLog(interaction.guild, "WARN", user.tag, interaction.user.tag, reason);

        const embed = new EmbedBuilder()
            .setColor(0xffcc00)
            .setDescription(`⚠️ ${user.tag} has been warned\n**Reason:** ${reason}`);

        interaction.reply({ embeds: [embed] });
    }
};