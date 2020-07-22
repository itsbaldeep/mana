const { MessageEmbed } = require("discord.js");
const { color } = require("../config.json");

module.exports.positiveEmbed = author => {
    return new MessageEmbed()
        .setColor(color.primary)
        .setAuthor(author.username + "#" + author.discriminator, author.displayAvatarURL())
        .setTimestamp()
}

module.exports.negativeEmbed = author => {
    return new MessageEmbed()
        .setColor(color.warning)
        .setAuthor(author.username + "#" + author.discriminator, author.displayAvatarURL())
        .setTimestamp()
}
