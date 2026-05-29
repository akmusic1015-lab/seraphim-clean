const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removerolehumans")
        .setDescription("Remove a role from all humans")
        .addRoleOption(o =>
            o.setName("role")
                .setDescription("Role to remove")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "❌ No permission.", flags: 64 });

        const role = interaction.options.getRole("role");

        interaction.guild.members.cache
            .filter(m => !m.user.bot)
            .forEach(m => {
                m.roles.remove(role).catch(() => {});
            });

        return interaction.reply(`➖ Removed role from all humans`);
    }
};