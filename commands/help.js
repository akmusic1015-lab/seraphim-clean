const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    StringSelectMenuBuilder
} = require("discord.js");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("help")
        .setDescription("View bot commands"),

    async execute(interaction) {

        const homeEmbed = new EmbedBuilder()

            .setTitle("✦ Seraphim Utilities")

            .setDescription(
                "Select a category below to view commands."
            )

            .setColor(0x2b2d31)

            .addFields(
                {
                    name: "📚 Categories",
                    value:
                        "💰 Economy\n" +
                        "🎰 Gambling\n" +
                        "📈 Activity\n" +
                        "🛠️ Utility"
                }
            )

            .setFooter({
                text: "Seraphim Utilities"
            });

        const menu =
            new StringSelectMenuBuilder()

                .setCustomId("help-menu")

                .setPlaceholder(
                    "Select a category"
                )

                .addOptions([

                    {
                        label: "Economy",
                        description:
                            "Economy commands",
                        value: "economy",
                        emoji: "💰"
                    },

                    {
                        label: "Gambling",
                        description:
                            "Gambling commands",
                        value: "gambling",
                        emoji: "🎰"
                    },

                    {
                        label: "Activity",
                        description:
                            "Activity commands",
                        value: "activity",
                        emoji: "📈"
                    },

                    {
                        label: "Utility",
                        description:
                            "Utility commands",
                        value: "utility",
                        emoji: "🛠️"
                    }

                ]);

        const row =
            new ActionRowBuilder()
                .addComponents(menu);

        const msg =
            await interaction.reply({

                embeds: [homeEmbed],
                components: [row],
                fetchReply: true
            });

        const collector =
            msg.createMessageComponentCollector({
                time: 120000
            });

        collector.on("collect", async i => {

            if (i.user.id !== interaction.user.id) {

                return i.reply({
                    content:
                        "❌ This menu isn't for you.",
                    flags: 64
                });
            }

            let embed;

            // =========================
            // ECONOMY
            // =========================
            if (i.values[0] === "economy") {

                embed = new EmbedBuilder()

                    .setTitle("💰 Economy Commands")

                    .setColor(0x57f287)

                    .setDescription(

                        "`/balance`\n" +
                        "`/daily`\n" +
                        "`/work`\n" +
                        "`/beg`\n" +
                        "`/deposit`\n" +
                        "`/withdraw`\n" +
                        "`/give`\n" +
                        "`/leaderboard coins`"
                    );
            }

            // =========================
            // GAMBLING
            // =========================
            if (i.values[0] === "gambling") {

                embed = new EmbedBuilder()

                    .setTitle("🎰 Gambling Commands")

                    .setColor(0xed4245)

                    .setDescription(

                        "`/coinflip`\n" +
                        "`/slots`\n" +
                        "`/blackjack`"
                    );
            }

            // =========================
            // ACTIVITY
            // =========================
            if (i.values[0] === "activity") {

                embed = new EmbedBuilder()

                    .setTitle("📈 Activity Commands")

                    .setColor(0x5865f2)

                    .setDescription(

                        "`/profile`\n" +
                        "`/leaderboard messages`\n" +
                        "`/leaderboard voice`"
                    );
            }

            // =========================
            // UTILITY
            // =========================
            if (i.values[0] === "utility") {

                embed = new EmbedBuilder()

                    .setTitle("🛠️ Utility Commands")

                    .setColor(0xfee75c)

                    .setDescription(

                        "`/help`\n" +
                        "`/ping`"
                    );
            }

            await i.update({
                embeds: [embed],
                components: [row]
            });

        });

        collector.on("end", async () => {

            await msg.edit({
                components: []
            }).catch(() => {});
        });

    }
};