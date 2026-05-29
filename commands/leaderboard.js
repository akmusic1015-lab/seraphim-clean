const {
    SlashCommandBuilder,
    EmbedBuilder,
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle,
    ComponentType
} = require("discord.js");

const db = require("../database/database");

const TOP_ROLE_ID = "ROLE_ID_HERE"; // 👈 CHANGE THIS

module.exports = {

    data: new SlashCommandBuilder()
        .setName("leaderboard")
        .setDescription("View server leaderboards")
        .addStringOption(option =>
            option
                .setName("type")
                .setDescription("Leaderboard type")
                .setRequired(true)
                .addChoices(
                    { name: "Coins", value: "coins" },
                    { name: "Messages", value: "messages" },
                    { name: "Voice", value: "voice" },
                    { name: "Streaks", value: "streaks" }
                )
        ),

    async execute(interaction) {

        const type = interaction.options.getString("type");

        // =========================
        // NORMAL LEADERBOARDS
        // =========================
        if (type === "coins" || type === "messages" || type === "voice") {

            let users;

            if (type === "coins") {
                users = db.prepare(`
                    SELECT userId, wallet
                    FROM users
                    ORDER BY wallet DESC
                    LIMIT 10
                `).all();
            }

            if (type === "messages") {
                users = db.prepare(`
                    SELECT userId, totalMessages
                    FROM users
                    ORDER BY totalMessages DESC
                    LIMIT 10
                `).all();
            }

            if (type === "voice") {
                users = db.prepare(`
                    SELECT userId, totalVcMinutes
                    FROM users
                    ORDER BY totalVcMinutes DESC
                    LIMIT 10
                `).all();
            }

            let desc = "";

            for (let i = 0; i < users.length; i++) {

                const u = users[i];

                let value = "";

                if (type === "coins") value = `🪙 ${u.wallet}`;
                if (type === "messages") value = `${u.totalMessages} msgs`;
                if (type === "voice") value = `${(u.totalVcMinutes / 60).toFixed(1)}h`;

                desc += `**${i + 1}.** <@${u.userId}> — ${value}\n`;
            }

            return interaction.reply({
                embeds: [
                    new EmbedBuilder()
                        .setTitle(`🏆 ${type.toUpperCase()} Leaderboard`)
                        .setColor(0x2b2d31)
                        .setDescription(desc || "No data.")
                ]
            });
        }

        // =========================
        // 🔥 STREAK LEADERBOARD
        // =========================

        if (type === "streaks") {

            const rows = db.prepare(`
                SELECT userId, messageStreak, recordStreak
                FROM users
                ORDER BY messageStreak DESC
                LIMIT 100
            `).all();

            if (!rows.length) {
                return interaction.reply("No streak data yet.");
            }

            let page = 0;
            const maxPage = Math.ceil(rows.length / 10);

            const medal = (r) => {
                if (r === 1) return "🥇";
                if (r === 2) return "🥈";
                if (r === 3) return "🥉";
                return `**${r}.**`;
            };

            const build = () => {

                const start = page * 10;
                const slice = rows.slice(start, start + 10);

                let desc = "";
                let rank = null;

                rows.forEach((r, i) => {
                    if (r.userId === interaction.user.id) rank = i + 1;
                });

                for (let i = 0; i < slice.length; i++) {

                    const r = slice[i];
                    const realRank = start + i + 1;

                    desc += `${medal(realRank)} <@${r.userId}>\n`;
                    desc += `🔥 Current: **${r.messageStreak}** | 🏆 Best: **${r.recordStreak}**\n\n`;
                }

                return new EmbedBuilder()
                    .setTitle(`🔥 Streak Leaderboard`)
                    .setColor(0xff4500)
                    .setDescription(desc)
                    .addFields({
                        name: "📍 Your Rank",
                        value: rank ? `#${rank}` : "Not ranked"
                    })
                    .setFooter({ text: `Page ${page + 1} / ${maxPage}` });
            };

            const buttons = () => new ActionRowBuilder().addComponents(
                new ButtonBuilder()
                    .setCustomId("prev")
                    .setLabel("⬅️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page === 0),

                new ButtonBuilder()
                    .setCustomId("next")
                    .setLabel("➡️")
                    .setStyle(ButtonStyle.Secondary)
                    .setDisabled(page >= maxPage - 1)
            );

            const msg = await interaction.reply({
                embeds: [build()],
                components: [buttons()],
                fetchReply: true
            });

            const collector = msg.createMessageComponentCollector({
                componentType: ComponentType.Button,
                time: 120000
            });

            collector.on("collect", async (i) => {

                if (i.user.id !== interaction.user.id) {
                    return i.reply({ content: "Not yours", flags: 64 });
                }

                if (i.customId === "prev") page--;
                if (i.customId === "next") page++;

                await i.update({
                    embeds: [build()],
                    components: [buttons()]
                });
            });

            collector.on("end", () => {
                msg.edit({ components: [] }).catch(() => {});
            });

            // =========================
            // 🎭 GIVE TOP ROLE
            // =========================

            const top = rows[0];

            const guild = interaction.guild;
            const role = guild.roles.cache.get(TOP_ROLE_ID);

            if (role) {

                const members = await guild.members.fetch().catch(() => null);

                if (members) {

                    guild.members.cache.forEach(m => {
                        if (m.roles.cache.has(TOP_ROLE_ID)) {
                            m.roles.remove(TOP_ROLE_ID).catch(() => {});
                        }
                    });

                    const topMember = await guild.members.fetch(top.userId).catch(() => null);

                    if (topMember) {
                        topMember.roles.add(role).catch(() => {});
                    }
                }
            }
        }
    }
};