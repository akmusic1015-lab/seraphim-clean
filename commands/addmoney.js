const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("addmoney")
        .setDescription("Add money to a user")
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

        // =========================
        // ROLE CHECK
        // =========================
        const allowedRoles = [
            process.env.OWNER_ROLE,
            process.env.CO_OWNER_ROLE
        ];

        const hasPermission =
            interaction.member.roles.cache.some(
                role => allowedRoles.includes(role.id)
            );

        if (!hasPermission) {
            return interaction.reply({
                content: "❌ You cannot use this command.",
                flags: 64
            });
        }

        // =========================
        // GET TARGET
        // =========================
        let target =
            interaction.options?.getUser("user");

        let amount =
            interaction.options?.getInteger("amount");

        // prefix support
        if (!target && args?.[0]) {

            target =
                interaction.guild.members.cache.get(
                    args[0].replace(/[<@!>]/g, "")
                )?.user;

            amount = parseInt(args[1]);
        }

        if (!target) {
            return interaction.reply({
                content: "❌ Invalid user."
            });
        }

        if (!amount || amount <= 0) {
            return interaction.reply({
                content: "❌ Invalid amount."
            });
        }

        // create user
        getUser(target.id);

        // =========================
        // ADD MONEY
        // =========================
        db.prepare(`
            UPDATE users
            SET wallet = wallet + ?
            WHERE userId = ?
        `).run(
            amount,
            target.id
        );

        const embed = new EmbedBuilder()
            .setTitle("💰 Money Added")
            .setColor(0x2b2d31)
            .setDescription(
                `Added 🪙 ${amount.toLocaleString()} to ${target}`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};