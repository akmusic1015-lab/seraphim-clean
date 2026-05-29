const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("treestats")
        .setDescription("View the server tree stats"),

    async execute(interaction) {

        // =========================
        // GET TREE
        // =========================

        const tree = db.prepare(`
            SELECT *
            FROM tree
            WHERE id = 1
        `).get();

        if (!tree) {
            return interaction.reply({
                content: "❌ Tree data not found.",
                flags: 64
            });
        }

        // =========================
        // EVENT COUNT (safe fallback)
        // =========================
        // (if you later store events in DB, this will work automatically)
        const eventCount = tree.events || 0;

        // =========================
        // CONTRIBUTORS
        // =========================

        const contributors = db.prepare(`
            SELECT *
            FROM tree_contributors
            ORDER BY xp DESC
            LIMIT 5
        `).all();

        let topText;

        if (!contributors.length) {
            topText = "🌱 No contributions yet — be the first to grow the tree!";
        } else {
            topText = contributors
                .map((u, i) =>
                    `**${i + 1}.** <@${u.userId}> — 🌿 ${u.xp} XP`
                )
                .join("\n");
        }

        // =========================
        // XP BAR
        // =========================

        const progress = Math.floor((tree.xp / tree.nextLevelXp) * 10);

        const xpBar =
            "🟩".repeat(Math.max(0, progress)) +
            "⬛".repeat(Math.max(0, 10 - progress));

        // =========================
        // EMBED
        // =========================

        const embed = new EmbedBuilder()

            .setColor("#43b581")
            .setTitle("🌳 Server Tree System")

            .setDescription(
                `A shared ecosystem that grows with every message in the server.\n` +
                `Work together to evolve the tree into something legendary 🌿`
            )

            .addFields(

                {
                    name: "📊 Tree Stats",
                    value:
                        `🏆 **Level:** ${tree.level}\n` +
                        `🌿 **XP:** ${tree.xp} / ${tree.nextLevelXp}\n` +
                        `💧 **Water:** ${tree.water}`,
                    inline: true
                },

                {
                    name: "📈 Progress",
                    value: xpBar || "⬛⬛⬛⬛⬛⬛⬛⬛⬛⬛",
                    inline: true
                },

                {
                    name: "⚡ System Data",
                    value:
                        `🌿 Total XP Generated: **${tree.xp}**\n` +
                        `💧 Total Water Collected: **${tree.water}**\n` +
                        `🌩️ Random Events Triggered: **${eventCount}**`,
                    inline: false
                },

                {
                    name: "👑 Top Contributors",
                    value: topText,
                    inline: false
                }
            )

            .setFooter({
                text: "Keep chatting — the tree evolves with the community 🌳"
            });

        await interaction.reply({
            embeds: [embed]
        });
    }
};