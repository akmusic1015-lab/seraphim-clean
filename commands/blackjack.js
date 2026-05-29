const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

function drawCard() {

    const cards = [
        2,3,4,5,6,7,8,9,10,10,10,10,11
    ];

    return cards[
        Math.floor(Math.random() * cards.length)
    ];
}

function calculateTotal(cards) {

    let total = cards.reduce((a, b) => a + b, 0);

    let aces =
        cards.filter(c => c === 11).length;

    while (total > 21 && aces > 0) {
        total -= 10;
        aces--;
    }

    return total;
}

module.exports = {

    data: new SlashCommandBuilder()
        .setName("blackjack")
        .setDescription("Play blackjack")
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

        let playerCards = [
            drawCard(),
            drawCard()
        ];

        let dealerCards = [
            drawCard(),
            drawCard()
        ];

        const hitButton =
            new ButtonBuilder()
                .setCustomId("blackjack_hit")
                .setLabel("Hit")
                .setStyle(ButtonStyle.Primary);

        const standButton =
            new ButtonBuilder()
                .setCustomId("blackjack_stand")
                .setLabel("Stand")
                .setStyle(ButtonStyle.Secondary);

        const row =
            new ActionRowBuilder()
                .addComponents(
                    hitButton,
                    standButton
                );

        const createEmbed = (hiddenDealer = true) => {

            const playerTotal =
                calculateTotal(playerCards);

            const dealerTotal =
                calculateTotal(dealerCards);

            return new EmbedBuilder()
                .setTitle("🃏 Blackjack")
                .setColor(0x2b2d31)
                .setDescription(
                    `## Your Cards\n` +
                    `${playerCards.join(", ")}\n` +
                    `Total: **${playerTotal}**\n\n` +

                    `## Dealer Cards\n` +
                    (
                        hiddenDealer
                            ? `${dealerCards[0]}, ?`
                            : `${dealerCards.join(", ")}`
                    ) +
                    `\n` +
                    (
                        hiddenDealer
                            ? ""
                            : `Total: **${dealerTotal}**`
                    )
                );
        };

        const message =
            await interaction.reply({
                embeds: [createEmbed()],
                components: [row],
                fetchReply: true
            });

        const collector =
            message.createMessageComponentCollector({
                time: 60000
            });

        collector.on("collect", async i => {

            if (i.user.id !== interaction.user.id) {
                return i.reply({
                    content: "❌ This is not your game.",
                    flags: 64
                });
            }

            // HIT
            if (i.customId === "blackjack_hit") {

                playerCards.push(drawCard());

                const total =
                    calculateTotal(playerCards);

                // bust
                if (total > 21) {

                    db.prepare(`
                        UPDATE users
                        SET wallet = wallet - ?
                        WHERE userId = ?
                    `).run(
                        amount,
                        interaction.user.id
                    );

                    collector.stop("lose");

                    return i.update({
                        embeds: [
                            createEmbed(false)
                                .setColor(0xed4245)
                                .setFooter({
                                    text: `Bust! You lost 🪙 ${amount}`
                                })
                        ],
                        components: []
                    });
                }

                return i.update({
                    embeds: [createEmbed()],
                    components: [row]
                });
            }

            // STAND
            if (i.customId === "blackjack_stand") {

                while (
                    calculateTotal(dealerCards) < 17
                ) {
                    dealerCards.push(drawCard());
                }

                const playerTotal =
                    calculateTotal(playerCards);

                const dealerTotal =
                    calculateTotal(dealerCards);

                let result = "";

                let color = 0x2b2d31;

                if (
                    dealerTotal > 21 ||
                    playerTotal > dealerTotal
                ) {

                    db.prepare(`
                        UPDATE users
                        SET wallet = wallet + ?
                        WHERE userId = ?
                    `).run(
                        amount,
                        interaction.user.id
                    );

                    result =
                        `✅ You won 🪙 ${amount}`;

                    color = 0x57f287;

                } else if (
                    playerTotal < dealerTotal
                ) {

                    db.prepare(`
                        UPDATE users
                        SET wallet = wallet - ?
                        WHERE userId = ?
                    `).run(
                        amount,
                        interaction.user.id
                    );

                    result =
                        `❌ You lost 🪙 ${amount}`;

                    color = 0xed4245;

                } else {

                    result = "🤝 Push";
                }

                collector.stop();

                return i.update({
                    embeds: [
                        createEmbed(false)
                            .setColor(color)
                            .setFooter({
                                text: result
                            })
                    ],
                    components: []
                });
            }
        });

        collector.on("end", async (_, reason) => {

            if (reason === "time") {

                await interaction.editReply({
                    components: []
                }).catch(() => {});
            }
        });
    }
};