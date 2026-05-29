const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("temprole")
        .setDescription("Give a temporary role to a user")
        .addUserOption(o =>
            o.setName("user")
                .setDescription("User")
                .setRequired(true)
        )
        .addRoleOption(o =>
            o.setName("role")
                .setDescription("Role")
                .setRequired(true)
        )
        .addIntegerOption(o =>
            o.setName("minutes")
                .setDescription("Duration in minutes")
                .setRequired(true)
        ),

    async execute(interaction, client) {
        if (!client.isStaff(interaction.member))
            return interaction.reply({ content: "❌ No permission.", flags: 64 });

        const user = interaction.options.getUser("user");
        const role = interaction.options.getRole("role");
        const minutes = interaction.options.getInteger("minutes");

        const member = await interaction.guild.members.fetch(user.id);

        // 🔒 SAFE ROLE ADD
        try {
            await member.roles.add(role);
        } catch (err) {
            console.log("Role add failed:", err);
            return interaction.reply({
                content: "❌ I can't give that role. Check my permissions / role hierarchy.",
                flags: 64
            });
        }

        // ⏳ REMOVE AFTER TIME (safe)
        setTimeout(async () => {
            try {
                await member.roles.remove(role);
            } catch (err) {
                console.log("Role remove failed:", err);
            }
        }, minutes * 60000);

        return interaction.reply(`⏳ Temp role given for **${minutes} minutes**`);
    }
};