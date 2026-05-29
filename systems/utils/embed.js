const {
    EmbedBuilder
} = require("discord.js");

module.exports = () => {

    return new EmbedBuilder()

        .setColor(0x2b2d31)

        .setFooter({
            text: "Seraphim Utilities"
        })

        .setTimestamp();
};