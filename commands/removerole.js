const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("removerole")
        .setDescription("Remove a role from a user")
        .addUserOption(o =>
            o.setName("user")
                .setDescription("User to remove role from")
                .setRequired(true)
        )
        .addRoleOption(o =>
            o.setName("role")
                .setDescription("Role to remove")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "❌ No permission.", flags: 64 });

        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");

        const member = await interaction.guild.members.fetch(user.id);
        await member.roles.remove(role);

        return interaction.reply(`➖ Removed **${role.name}** from **${user.tag}**`);
    }
};