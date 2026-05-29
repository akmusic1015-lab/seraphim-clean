const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("balance")
        .setDescription("View your balance"),

    async execute(interaction) {

        const user = getUser(interaction.user.id);

        const embed = new EmbedBuilder()
            .setTitle("💰 Economy Balance")
            .setColor(0x2b2d31)
            .addFields(
                {
                    name: "Wallet",
                    value: `🪙 ${user.wallet.toLocaleString()}`,
                    inline: true
                },
                {
                    name: "Bank",
                    value: `🏦 ${user.bank.toLocaleString()}`,
                    inline: true
                },
                {
                    name: "Messages",
                    value: `💬 ${user.messages.toLocaleString()}`,
                    inline: true
                },
                {
                    name: "VC Minutes",
                    value: `🎤 ${user.vcMinutes.toLocaleString()}`,
                    inline: true
                }
            )
            .setFooter({
                text: interaction.user.username,
                iconURL: interaction.user.displayAvatarURL()
            });

        await interaction.reply({
            embeds: [embed]
        });
    }
};