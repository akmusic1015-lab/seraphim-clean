const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("withdraw")
        .setDescription("Withdraw money from your bank")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Amount to withdraw")
                .setRequired(true)
        ),

    async execute(interaction, client, args) {

        const amount = interaction.options?.getInteger("amount")
            || parseInt(args?.[0]);

        if (!amount || amount <= 0) {
            return interaction.reply({
                content: "❌ Enter a valid amount.",
                flags: 64
            });
        }

        const user = getUser(interaction.user.id);

        if (user.bank < amount) {
            return interaction.reply({
                content: "❌ You do not have enough money in your bank.",
                flags: 64
            });
        }

        db.prepare(`
            UPDATE users
            SET
                wallet = wallet + ?,
                bank = bank - ?
            WHERE userId = ?
        `).run(
            amount,
            amount,
            interaction.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("💸 Withdraw")
            .setColor(0x2b2d31)
            .setDescription(
                `Withdrew 🪙 ${amount.toLocaleString()} from your bank.`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};