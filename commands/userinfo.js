const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("userinfo")
        .setDescription("Get user info")
        .addUserOption(o =>
            o.setName("user")
                .setDescription("User")
                .setRequired(false)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user") || interaction.user;

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("👤 User Info")
            .addFields(
                { name: "User", value: user.tag, inline: true },
                { name: "ID", value: user.id, inline: true }
            )
            .setThumbnail(user.displayAvatarURL());

        return interaction.reply({ embeds: [embed] });
    }
};