const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("profile")
        .setDescription("View your profile")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to view")
                .setRequired(false)
        ),

    async execute(interaction, client, args) {

        let target =
            interaction.options?.getUser("user");

        // prefix support
        if (!target && args?.[0]) {

            target =
                interaction.mentions.users.first();
        }

        if (!target)
            target = interaction.user;

        const user =
            getUser(target.id);

        const vcHours =
            (user.totalVcMinutes / 60)
                .toFixed(1);

        const weeklyVcHours =
            (user.weeklyVcMinutes / 60)
                .toFixed(1);

        const embed = new EmbedBuilder()

            .setTitle(
                `✦ ${target.username}'s Profile`
            )

            .setColor(0x2b2d31)

            .setThumbnail(
                target.displayAvatarURL({
                    dynamic: true
                })
            )

            .addFields(

                {
                    name: "💰 Economy",
                    value:
                        `Wallet: 🪙 ${user.wallet.toLocaleString()}\n` +
                        `Bank: 🏦 ${user.bank.toLocaleString()}`
                },

                {
                    name: "💬 Messages",
                    value:
                        `Total: ${user.totalMessages.toLocaleString()}\n` +
                        `Weekly: ${user.weeklyMessages.toLocaleString()}`
                },

                {
                    name: "🎤 Voice Activity",
                    value:
                        `Total: ${vcHours}h\n` +
                        `Weekly: ${weeklyVcHours}h`
                },

                {
                    name: "🔥 Streaks",
                    value:
                        `Message Streak: ${user.messageStreak}`
                }

            )

            .setFooter({
                text: "Seraphim Utilities"
            })

            .setTimestamp();

        await interaction.reply({
            embeds: [embed]
        });
    }
};