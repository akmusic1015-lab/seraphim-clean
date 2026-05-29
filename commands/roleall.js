const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("roleall")
        .setDescription("Give a role to all members")
        .addRoleOption(o =>
            o.setName("role")
                .setDescription("Role to give")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "❌ No permission.", flags: 64 });

        const role = interaction.options.getRole("role");

        interaction.guild.members.cache.forEach(m => {
            m.roles.add(role).catch(() => {});
        });

        return interaction.reply(`➕ Added **${role.name}** to all members`);
    }
};