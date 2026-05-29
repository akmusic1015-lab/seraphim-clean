const { SlashCommandBuilder, PermissionsBitField, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("purge")
        .setDescription("Delete messages in bulk")
        .addIntegerOption(o =>
            o.setName("amount")
                .setDescription("1 - 100 messages")
                .setRequired(true)
        ),

    async execute(interaction) {

        if (!interaction.member.permissions.has(PermissionsBitField.Flags.ManageMessages)) {
            return interaction.reply({
                content: "❌ Missing **Manage Messages** permission.",
                flags: 64
            });
        }

        const amount = interaction.options.getInteger("amount");

        if (amount < 1 || amount > 100) {
            return interaction.reply({
                content: "❌ Amount must be between **1 - 100**.",
                flags: 64
            });
        }

        await interaction.channel.bulkDelete(amount, true);

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setDescription(`🧹 Cleaned **${amount} messages** from this channel.`);

        return interaction.reply({ embeds: [embed], flags: 64 });
    }
};