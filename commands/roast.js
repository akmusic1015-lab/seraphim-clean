const { SlashCommandBuilder } = require("discord.js");

const roasts = [
    "You're like lag—always ruining things.",
    "Even Google can't find your relevance.",
    "You bring everyone's IQ down just by typing."
];

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roast")
        .setDescription("Roast someone")
        .addUserOption(o =>
            o.setName("user")
                .setDescription("User to roast")
                .setRequired(true)
        ),

    async execute(interaction) {
        const user = interaction.options.getUser("user");
        const roast = roasts[Math.floor(Math.random() * roasts.length)];

        interaction.reply(`🔥 ${user} ${roast}`);
    }
};