const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lock")
        .setDescription("Lock this channel"),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ No permission.", flags: 64 });
        }

        await interaction.channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
            SendMessages: false
        });

        const embed = new EmbedBuilder()
            .setColor(0xff4d4d)
            .setDescription("🔒 This channel is now **locked**.");

        interaction.reply({ embeds: [embed] });
    }
};