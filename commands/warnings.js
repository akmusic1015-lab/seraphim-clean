const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("warnings")
        .setDescription("Check user warnings")
        .addUserOption(o =>
            o.setName("user").setDescription("User").setRequired(true)
        ),

    async execute(interaction, client) {

        const user = interaction.options.getUser("user");

        interaction.reply(`📜 ${user.tag} has no warning database set yet.`);
    }
};