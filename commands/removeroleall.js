const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removeroleall")
        .setDescription("Remove a role from all members")
        .addRoleOption(o =>
            o.setName("role")
                .setDescription("Role to remove")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "❌ No permission.", flags: 64 });

        const role = interaction.options.getRole("role");

        interaction.guild.members.cache.forEach(m => {
            m.roles.remove(role).catch(() => {});
        });

        return interaction.reply(`➖ Removed **${role.name}** from all members`);
    }
};