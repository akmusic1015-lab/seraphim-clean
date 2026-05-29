const { SlashCommandBuilder, EmbedBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("addrole")
        .setDescription("Add a role to a user")
        .addUserOption(o => o.setName("user").setDescription("User").setRequired(true))
        .addRoleOption(o => o.setName("role").setDescription("Role").setRequired(true)),

    async execute(interaction, client) {

        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "❌ No permission.", flags: 64 });

        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");

        const member = await interaction.guild.members.fetch(user.id);

        await member.roles.add(role);

        const embed = new EmbedBuilder()
            .setColor(0x57f287)
            .setDescription(`➕ Added **${role.name}** to **${user.tag}**`);

        interaction.reply({ embeds: [embed] });
    }
};