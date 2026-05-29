require('./database/database.js');
require("dotenv").config();

const fs = require("fs");
const path = require("path");

const { handleDailyStreak } = require("./systems/utils/streaks");
const { updateTopStreakRole } = require("./systems/streaks/autoRole");
const treeSystem = require("./systems/tree/treeSystem");

process.on("unhandledRejection", console.error);
process.on("uncaughtException", console.error);

const {
    Client,
    GatewayIntentBits,
    Collection
} = require("discord.js");

// =========================
// CLIENT
// =========================

const client = new Client({

    intents: [

        GatewayIntentBits.Guilds,

        GatewayIntentBits.GuildMessages,

        GatewayIntentBits.GuildVoiceStates,

        GatewayIntentBits.MessageContent,

        GatewayIntentBits.GuildMembers
    ]
});

// =========================
// COMMANDS
// =========================

client.commands =
new Collection();

// =========================
// GLOBAL EMBED SYSTEM
// =========================

const createEmbed =
require("./systems/utils/embed");

client.embed =
createEmbed;

// =========================
// SYSTEMS
// =========================

client.counting =
new Map();

// =========================
// CONFIG
// =========================

const CONFIG = {

    prefix: "s!",

    modLogChannel:
    "1496715792052650044",

    staffRoles: [

        "1493010409009975357",

        "1492985455073955861",

        "1493710195157766284"
    ]
};

// =========================
// 🔥 STREAK MESSAGE SYSTEM
// =========================

client.on("messageCreate", async (message) => {

    if (message.author.bot) return;

    handleDailyStreak(message.author.id);

    await updateTopStreakRole(client);
});

// =========================
// IMPORT SYSTEMS
// =========================

const activeChatter =
require("./systems/activity/activeChatter");

const achievementRoles =
require("./systems/activity/achievementRoles");

const weeklyReset =
require("./systems/activity/weeklyReset");

const voiceTracker =
require("./systems/voice/voiceTracker");

const activeVC =
require("./systems/voice/activeVC");

const dailyQuestions =
require("./systems/dailyQuestions/dailyQuestions");

// =========================
// STAFF CHECK
// =========================

client.isStaff = (member) =>

    member.roles.cache.some(r =>
        CONFIG.staffRoles.includes(r.id)
    );

// =========================
// MOD LOG SYSTEM
// =========================

client.modLog = (
    guild,
    action,
    user,
    moderator,
    reason = "No reason provided"
) => {

    const channel =
    guild.channels.cache.get(
        CONFIG.modLogChannel
    );

    if (!channel) return;

    const embed =
    client.embed()

        .setTitle(`🛡️ ${action}`)

        .setColor(0xff4d4d)

        .addFields(

            {
                name: "User",
                value: `${user}`,
                inline: true
            },

            {
                name: "Moderator",
                value: `${moderator}`,
                inline: true
            },

            {
                name: "Reason",
                value: reason
            }
        );

    channel.send({
        embeds: [embed]
    });
};

// =========================
// COMMAND HANDLER
// =========================

console.log("📦 Loading commands...");

const commandFiles =
fs.readdirSync("./commands")
.filter(f => f.endsWith(".js"));

for (const file of commandFiles) {

    try {

        const cmd =
        require(
            path.join(
                __dirname,
                "commands",
                file
            )
        );

        if (
            !cmd?.data?.name ||
            !cmd?.execute
        ) {

            console.log(
                `❌ Invalid: ${file}`
            );

            continue;
        }

        client.commands.set(
            cmd.data.name,
            cmd
        );

        console.log(
            `✅ Loaded: ${cmd.data.name}`
        );

    } catch (err) {

        console.log(
            `❌ Error loading ${file}:`,
            err.message
        );
    }
}

// =========================
// SLASH COMMANDS
// =========================

client.on(
    "interactionCreate",
    async (interaction) => {

        if (
            !interaction.isChatInputCommand()
        ) return;

        const command =
        client.commands.get(
            interaction.commandName
        );

        if (!command) return;

        try {

            await command.execute(
                interaction,
                client
            );

        } catch (err) {

            console.error(err);

            if (
                interaction.replied ||
                interaction.deferred
            ) {

                await interaction.followUp({

                    content:
                    "❌ Command error.",

                    flags: 64

                }).catch(() => {});

            } else {

                await interaction.reply({

                    content:
                    "❌ Command error.",

                    flags: 64

                }).catch(() => {});
            }
        }
    }
);

// =========================
// PREFIX COMMANDS
// =========================

client.on(
    "messageCreate",
    async (message) => {

        if (message.author.bot) return;

        if (
            !message.content.startsWith(
                CONFIG.prefix
            )
        ) return;

        const args =
        message.content
            .slice(CONFIG.prefix.length)
            .trim()
            .split(/ +/);

        const commandName =
        args.shift().toLowerCase();

        const command =
        client.commands.get(commandName);

        if (!command) return;

        try {

            const fakeInteraction = {

                user:
                message.author,

                member:
                message.member,

                guild:
                message.guild,

                channel:
                message.channel,

                options: {

                    getUser: () => null,

                    getInteger: () => null,

                    getString: () => null
                },

                reply: async (data) => {

                    if (
                        typeof data === "string"
                    ) {

                        return message.reply(data);
                    }

                    return message.reply(data);
                },

                editReply: async (data) => {

                    return message.reply(data);
                }
            };

            await command.execute(
                fakeInteraction,
                client,
                args
            );

        } catch (err) {

            console.error(err);

            message.reply(
                "❌ Command error."
            );
        }
    }
);

// =========================
// COUNTING SYSTEM
// =========================

client.on(
    "messageCreate",
    async (message) => {

        if (message.author.bot) return;

        const data =
        client.counting.get(
            message.channel.id
        );

        if (!data) return;

        const num =
        parseInt(message.content);

        if (isNaN(num)) {

            await message.delete()
            .catch(() => {});

            return;
        }

        if (num !== data.nextNumber) {

            await message.react("🤡")
            .catch(() => {});

            client.counting.set(
                message.channel.id,
                {
                    nextNumber: 1,
                    lastUser: null,
                    streak: 0
                }
            );

            return message.channel.send(
                "❌ Wrong number — reset to **1**"
            );
        }

        if (
            message.author.id ===
            data.lastUser
        ) {

            await message.react("🤡")
            .catch(() => {});

            client.counting.set(
                message.channel.id,
                {
                    nextNumber: 1,
                    lastUser: null,
                    streak: 0
                }
            );

            return message.channel.send(
                "❌ No double counting — reset to **1**"
            );
        }

        data.nextNumber++;

        data.lastUser =
        message.author.id;

        data.streak++;

        client.counting.set(
            message.channel.id,
            data
        );

        await message.react("✅")
        .catch(() => {});

        if (
            (data.nextNumber - 1) % 50 === 0
        ) {

            message.channel.send(
                `🔥 Milestone reached: **${data.nextNumber - 1}**`
            );
        }
    }
);


// =========================
// READY
// =========================

client.once(
    "clientReady",
    async () => {

        console.log("━━━━━━━━━━━━━━━━━━━");

        console.log(
            `🤖 ${client.user.tag} is online`
        );

        console.log(
            `✅ Loaded ${client.commands.size} commands`
        );

        console.log(
            "✅ Systems initialized"
        );

        console.log(
            "🟢 Bot heartbeat started"
        );

        console.log("━━━━━━━━━━━━━━━━━━━");

        // =========================
        // STATUS ROTATION
        // =========================

        const statuses = [

            "s!help | Seraphim Sips",

            "Protecting my Queen Angel and the Community",

            `${client.guilds.cache.size} servers protected`,

        ];

        let statusIndex = 0;

        const updateStatus = () => {

            client.user.setPresence({

                activities: [
                    {
                        name: statuses[statusIndex],
                        type: 0,
                    },
                ],

                status: "online",
            });

            statusIndex++;

            if (statusIndex >= statuses.length) {
                statusIndex = 0;
            }
        };

        // SET FIRST STATUS
        updateStatus();

        // ROTATE STATUS
        setInterval(updateStatus, 15000);

        // HEARTBEAT LOGGER
        setInterval(() => {

            console.log(
                `💓 Alive | ${new Date().toLocaleTimeString()}`
            );

        }, 30000);
    }
);

// =========================
// START SYSTEMS
// =========================

voiceTracker(client);

activeChatter(client);

activeVC(client);

achievementRoles(client);

weeklyReset();

dailyQuestions(client);

treeSystem(client);

// =========================
// LOGIN
// =========================

client.login(
    process.env.TOKEN
);