const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

const symbols = [
    "🍒",
    "🍋",
    "🍉",
    "⭐",
    "💎"
];

module.exports = {

    data: new SlashCommandBuilder()
        .setName("slots")
        .setDescription("Play the slot machine")
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Amount to bet")
                .setRequired(true)
        ),

    async execute(interaction, client, args) {

        let amount =
            interaction.options?.getInteger("amount");

        // prefix support
        if (!amount && args?.[0]) {
            amount = parseInt(args[0]);
        }

        if (!amount || amount <= 0) {
            return interaction.reply({
                content: "❌ Invalid amount."
            });
        }

        const user = getUser(interaction.user.id);

        if (user.wallet < amount) {
            return interaction.reply({
                content: "❌ You do not have enough money."
            });
        }

        const slot1 =
            symbols[Math.floor(Math.random() * symbols.length)];

        const slot2 =
            symbols[Math.floor(Math.random() * symbols.length)];

        const slot3 =
            symbols[Math.floor(Math.random() * symbols.length)];

        let winnings = 0;

        // JACKPOT
        if (slot1 === slot2 && slot2 === slot3) {

            if (slot1 === "💎") {
                winnings = amount * 10;
            } else if (slot1 === "⭐") {
                winnings = amount * 5;
            } else {
                winnings = amount * 3;
            }
        }

        // remove bet first
        db.prepare(`
            UPDATE users
            SET wallet = wallet - ?
            WHERE userId = ?
        `).run(
            amount,
            interaction.user.id
        );

        // add winnings
        if (winnings > 0) {

            db.prepare(`
                UPDATE users
                SET wallet = wallet + ?
                WHERE userId = ?
            `).run(
                winnings,
                interaction.user.id
            );
        }

        const won = winnings > 0;

        const embed = new EmbedBuilder()
            .setTitle("🎰 Slot Machine")
            .setColor(
                won
                    ? 0x57f287
                    : 0xed4245
            )
            .setDescription(
                `# ${slot1} ${slot2} ${slot3}\n\n` +
                (
                    won
                        ? `✅ You won 🪙 ${winnings.toLocaleString()}`
                        : `❌ You lost 🪙 ${amount.toLocaleString()}`
                )
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};