const db = require("../../database/database");

const TREE_CHANNEL_ID = "1509401518313308320";

const {
    ActionRowBuilder,
    ButtonBuilder,
    ButtonStyle
} = require("discord.js");

function waterButton() {
    return new ActionRowBuilder().addComponents(
        new ButtonBuilder()
            .setCustomId("water_tree")
            .setLabel("💧 Water")
            .setStyle(ButtonStyle.Primary)
    );
}

let treeMessage = null;
let tick = 0;

// =========================
// FRAMES
// =========================

const frames = [
`
        🌱
        │
        │
       🟫
`,
`
        🌿
       🌿
        │
       🟫
`,
`
       🌿🌿
        🌳
        │
       🟫
`,
`
      🌳🌿🌳
        🌳
       🟫🟫
`,
`
     🌳✨🌳
   🌳🌳🌳🌳
     🟫🟫
`
];

// =========================
// SAFE GET TREE
// =========================

function getTree() {
    return db.prepare(`SELECT * FROM tree WHERE id = 1`).get() || {
        level: 1,
        xp: 0,
        nextLevelXp: 100,
        water: 0,
        weather: "clear"
    };
}

// =========================
// SAFE BAR
// =========================

function bar(tree) {
    const max = tree.nextLevelXp || 100;
    const xp = Math.max(0, tree.xp || 0);

    const percent = Math.min(1, xp / max);
    const filled = Math.floor(percent * 10);

    return "🟩".repeat(filled) + "⬛".repeat(10 - filled);
}

// =========================
// WORLD STATE
// =========================

function world(tree) {
    return {
        mood:
            tree.level < 5 ? "🌱 fragile sprout" :
            tree.level < 15 ? "🌿 growing life" :
            tree.level < 30 ? "🌳 thriving forest" :
            "🌲 ancient ecosystem",

        weather:
            tree.weather === "rain" ? "🌧 rain boosts growth" :
            tree.weather === "drought" ? "🌵 slow growth" :
            "☀️ stable"
    };
}

// =========================
// LEVEL SYSTEM
// =========================

function levelUp(tree) {
    let leveled = false;

    while (tree.xp >= tree.nextLevelXp) {
        tree.xp -= tree.nextLevelXp;
        tree.level += 1;
        tree.nextLevelXp = Math.floor(tree.nextLevelXp * 1.35);
        leveled = true;
    }

    db.prepare(`
        UPDATE tree
        SET level = ?, xp = ?, nextLevelXp = ?
        WHERE id = 1
    `).run(tree.level, tree.xp, tree.nextLevelXp);

    return leveled;
}

// =========================
// SYSTEM
// =========================

module.exports = (client) => {

    // INIT MESSAGE
    client.once("clientReady", async () => {

        const channel = client.channels.cache.get(TREE_CHANNEL_ID);
        if (!channel) return;

        treeMessage = await channel.send({
            embeds: [{
                title: "🌳 Living Ecosystem Online",
                description: "🌱 World starting..."
            }],
            components: [waterButton()]
        });

        console.log("🌳 Tree System Loaded");
    });

    // XP SYSTEM
    client.on("messageCreate", async (message) => {

        if (message.author.bot) return;

        db.prepare(`
            UPDATE tree
            SET xp = xp + 1,
                water = water + 1
            WHERE id = 1
        `).run();

        const tree = getTree();
        levelUp(tree);
    });

    // BUTTON HANDLER (IMPORTANT)
    client.on("interactionCreate", async (interaction) => {

        if (!interaction.isButton()) return;
        if (interaction.customId !== "water_tree") return;

        db.prepare(`
            UPDATE tree
            SET water = water + 1
            WHERE id = 1
        `).run();

        db.prepare(`
            INSERT INTO tree_contributors (userId, xp, water)
            VALUES (?, 0, 1)
            ON CONFLICT(userId)
            DO UPDATE SET water = water + 1
        `).run(interaction.user.id);

        return interaction.reply({
            content: "💧 You watered the tree!",
            flags: 64
        });
    });

    // LIVE UPDATE LOOP
    setInterval(() => {

        if (!treeMessage) return;

        const tree = getTree();
        tick++;

        const frame = frames[tick % frames.length];
        const w = world(tree);

        treeMessage.edit({
            embeds: [{
                title: "🌳 Living Ecosystem",
                color: 0x43b581,
                description: `
\`\`\`
${frame}
\`\`\`

${w.mood}
🌦 ${w.weather}

━━━━━━━━━━━━
🏆 Level: ${tree.level}
🌿 XP: ${tree.xp} / ${tree.nextLevelXp}
${bar(tree)}

💧 Water: ${tree.water}
━━━━━━━━━━━━
                `
            }],
            components: [waterButton()]
        }).catch(() => {});
    }, 6000);
};