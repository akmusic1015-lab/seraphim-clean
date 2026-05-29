const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("rolehumans")
        .setDescription("Give a role to all humans")
        .addRoleOption(o =>
            o.setName("role")
                .setDescription("Role to give")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "❌ No permission.", flags: 64 });

        const role = interaction.options.getRole("role");

        interaction.guild.members.cache
            .filter(m => !m.user.bot)
            .forEach(m => {
                m.roles.add(role).catch(() => {});
            });

        return interaction.reply(`➕ Role given to all humans`);
    }
};