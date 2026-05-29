const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("deposit")
        .setDescription("Deposit money into your bank")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Amount to deposit")
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

        if (user.wallet < amount) {
            return interaction.reply({
                content: "❌ You do not have enough money in your wallet.",
                flags: 64
            });
        }

        db.prepare(`
            UPDATE users
            SET
                wallet = wallet - ?,
                bank = bank + ?
            WHERE userId = ?
        `).run(
            amount,
            amount,
            interaction.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("🏦 Deposit")
            .setColor(0x2b2d31)
            .setDescription(
                `Deposited 🪙 ${amount.toLocaleString()} into your bank.`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};