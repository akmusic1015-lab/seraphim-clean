const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("timeout")
        .setDescription("Timeout a user")
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("minutes").setDescription("Duration").setRequired(true)
        ),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "No permission", flags: 64 });

        const user = interaction.options.getUser("user");
        const minutes = interaction.options.getInteger("minutes");

        const member = await interaction.guild.members.fetch(user.id);

        await member.timeout(minutes * 60000);

        client.modLog(interaction.guild, "TIMEOUT", user.tag, interaction.user.tag, `${minutes} minutes`);

        const embed = new EmbedBuilder()
            .setColor(0xff6600)
            .setDescription(`⏳ ${user.tag} timed out for ${minutes} minutes`);

        interaction.reply({ embeds: [embed] });
    }
};