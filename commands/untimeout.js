const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("untimeout")
        .setDescription("Remove timeout")
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        ),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "No permission", flags: 64 });

        const user = interaction.options.getUser("user");
        const member = await interaction.guild.members.fetch(user.id);

        await member.timeout(null);

        client.modLog(interaction.guild, "UNTIMEOUT", user.tag, interaction.user.tag);

        interaction.reply(`🔓 Timeout removed for ${user.tag}`);
    }
};