const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("streaks-history")
        .setDescription("View past streak kings"),

    async execute(interaction) {

        const rows = db.prepare(`
            SELECT *
            FROM streak_history
            ORDER BY timestamp DESC
            LIMIT 50
        `).all();

        if (!rows.length) {
            return interaction.reply("No streak history yet.");
        }

        let page = 0;
        const perPage = 10;
        const maxPage = Math.ceil(rows.length / perPage);

        const formatDate = (ms) =>
            `<t:${Math.floor(ms / 1000)}:R>`;

        const build = () => {

            const start = page * perPage;
            const slice = rows.slice(start, start + perPage);

            let desc = "";

            for (let i = 0; i < slice.length; i++) {

                const r = slice[i];

                desc +=
                    `👑 <@${r.userId}>\n` +
                    `🔥 Streak: **${r.streak}**\n` +
                    `🕒 ${formatDate(r.timestamp)}\n\n`;
            }

            return new EmbedBuilder()
                .setTitle("📜 Streak Kings History")
                .setColor(0xffcc00)
                .setDescription(desc || "No data")
                .setFooter({
                    text: `Page ${page + 1} / ${maxPage}`
                });
        };

        await interaction.reply({
            embeds: [build()]
        });
    }
};