const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("countstats")
        .setDescription("View counting stats"),

    async execute(interaction, client) {

        const data = client.counting.get(interaction.channel.id);

        if (!data) {
            return interaction.reply("❌ Counting is not enabled here.");
        }

        const embed = new EmbedBuilder()
            .setColor(0x2b2d31)
            .setTitle("🔢 Counting Stats")
            .addFields(
                { name: "Next Number", value: `${data.nextNumber}`, inline: true },
                { name: "Streak", value: `${data.streak}`, inline: true }
            );

        interaction.reply({ embeds: [embed] });
    }
};