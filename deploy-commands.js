require("dotenv").config();
const fs = require("fs");
const path = require("path");
const { REST, Routes } = require("discord.js");

const commands = [];

console.log("🚀 Deploying commands...");

const commandFiles = fs.readdirSync("./commands").filter(f => f.endsWith(".js"));

for (const file of commandFiles) {
    try {
        const cmd = require(path.join(__dirname, "commands", file));

        if (!cmd?.data?.name) {
            console.log(`❌ Skipped: ${file}`);
            continue;
        }

        commands.push(cmd.data.toJSON());
        console.log(`✅ Added: ${cmd.data.name}`);

    } catch (err) {
        console.log(`❌ Error loading ${file}:`, err.message);
    }
}

console.log(`📦 Total commands: ${commands.length}`);

const rest = new REST({ version: "10" }).setToken(process.env.TOKEN);

(async () => {
    try {
        await rest.put(
            Routes.applicationCommands(process.env.CLIENT_ID),
            { body: commands }
        );

        console.log("✨ Commands successfully deployed");
    } catch (err) {
        console.error("❌ Deploy error:", err);
    }
})();