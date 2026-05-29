const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("unlock")
        .setDescription("Unlock this channel"),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ No permission.", flags: 64 });
        }

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: true
        });

        const embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setDescription("🔓 This channel is now **unlocked**.");

        interaction.reply({ embeds: [embed] });
    }
};