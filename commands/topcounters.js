const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("topcounters")
        .setDescription("Show top counters (placeholder system)"),

    async execute(interaction) {

        const embed = new EmbedBuilder()
            .setColor(0xfaa61a)
            .setTitle("🏆 Top Counters")
            .setDescription("This will become a leaderboard once database is added.\nFor now: system is tracking live counting only.");

        interaction.reply({ embeds: [embed] });
    }
};