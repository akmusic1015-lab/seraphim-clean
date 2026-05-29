const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("coinflip")
        .setDescription("Bet on a coinflip")
        .addStringOption(option =>
            option
                .setName("choice")
                .setDescription("heads or tails")
                .setRequired(true)
                .addChoices(
                    { name: "Heads", value: "heads" },
                    { name: "Tails", value: "tails" }
                )
        )
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Amount to bet")
                .setRequired(true)
        ),

    async execute(interaction, client, args) {

        let choice =
            interaction.options?.getString("choice");

        let amount =
            interaction.options?.getInteger("amount");

        if (!choice && args?.[0]) {
            choice = args[0].toLowerCase();
            amount = parseInt(args[1]);
        }

        if (!["heads", "tails"].includes(choice)) {
            return interaction.reply({
                content: "❌ Choose heads or tails."
            });
        }

        const user = getUser(interaction.user.id);

        if (!amount || amount <= 0) {
            return interaction.reply({
                content: "❌ Invalid amount."
            });
        }

        if (user.wallet < amount) {
            return interaction.reply({
                content: "❌ Not enough money."
            });
        }

        const result =
            Math.random() < 0.5
                ? "heads"
                : "tails";

        const won = choice === result;

        db.prepare(`
            UPDATE users
            SET wallet = wallet + ?
            WHERE userId = ?
        `).run(
            won ? amount : -amount,
            interaction.user.id
        );

        const embed = new EmbedBuilder()
            .setTitle("🪙 Coinflip")
            .setColor(0x2b2d31)
            .setDescription(
                `The coin landed on **${result}**\n\n` +
                (won
                    ? `✅ You won 🪙 ${amount.toLocaleString()}`
                    : `❌ You lost 🪙 ${amount.toLocaleString()}`)
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};