const {
    SlashCommandBuilder,
    EmbedBuilder
} = require("discord.js");

const db = require("../database/database");
const getUser = require("../systems/activity/getUser");

module.exports = {

    data: new SlashCommandBuilder()
        .setName("removemoney")
        .setDescription("Remove money from a user")
        .addUserOption(option =>
            option
                .setName("user")
                .setDescription("User to remove money from")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option
                .setName("amount")
                .setDescription("Amount of money")
                .setRequired(true)
        ),

    async execute(interaction, client, args) {

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

        getUser(target.id);

        db.prepare(`
            UPDATE users
            SET wallet = MAX(wallet - ?, 0)
            WHERE userId = ?
        `).run(
            amount,
            target.id
        );

        const embed = new EmbedBuilder()
            .setTitle("💸 Money Removed")
            .setColor(0x2b2d31)
            .setDescription(
                `Removed 🪙 ${amount.toLocaleString()} from ${target}`
            );

        await interaction.reply({
            embeds: [embed]
        });
    }
};