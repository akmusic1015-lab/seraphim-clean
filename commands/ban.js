const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("ban")
        .setDescription("Ban a user")
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        ),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "No permission", flags: 64 });

        const user = interaction.options.getUser("user");

        await interaction.guild.members.ban(user.id);

        client.modLog(interaction.guild, "BAN", user.tag, interaction.user.tag);

        interaction.reply(`🔨 Banned ${user.tag}`);
    }
};