const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("lockall")
        .setDescription("Lock all text channels"),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member)) {
            return interaction.reply({ content: "❌ No permission.", flags: 64 });
        }

        const channels = interaction.guild.channels.cache.filter(c => c.isTextBased());

        channels.forEach(channel => {
            channel.permissionOverwrites.edit(interaction.guild.roles.everyone, {
                SendMessages: false
            }).catch(() => {});
        });

        interaction.reply("🔒 All channels have been **locked**.");
    }
};