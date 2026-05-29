const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("give")
        .setDescription("Give money to another user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to give money to")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Amount of money")
                .setRequired(true)
        ),

    async execute(interaction, client, args) {

        let target =
            interaction.options?.getUser("user");

        let amount =
            interaction.options?.getInteger("amount");

        if (!target && args?.[0]) {

            target =
                interaction.guild.members.cache.get(
                    args[0].replace(/[<@!>]/g, "")
                )?.user;

            amount = parseInt(args[1]);
        }

        if (!target || target.bot) {
            return interaction.reply({
                content: "❌ Invalid user."
            });
        }

        if (!amount || amount <= 0) {
            return interaction.reply({
                content: "❌ Invalid amount."
            });
        }

        const sender = getUser(interaction.user.id);

        if (sender.wallet < amount) {
            return interaction.reply({
                content: "❌ You do not have enough money."
            });
        }

        getUser(target.id);

        db.prepare(`
            UPDATE users
            SET wallet = wallet - ?
            WHERE userId = ?
        `).run(
            amount,
            interaction.user.id
        );

        db.prepare(`
            UPDATE users
            SET wallet = wallet + ?
            WHERE userId = ?
        `).run(
            amount,
            target.id
        );

        const embed = new EmbedBuilder()
            .setTitle("🎁 Money Sent")
            .setColor(0x2b2d31)
            .setDescription(
                `${interaction.user} gave 🪙 ${amount.toLocaleString()} to ${target}`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};