const Discord = require("discord.js");
const User = require("../models/User");
const { replenishMana } = require("../formulas");
const { prefix, color } = require("../config.json");

module.exports.cooldown = 32;
module.exports.description = "You can meditate to replenish a large portion of your mana!";
module.exports.usage = `${prefix}meditate`;
module.exports.aliases = ["med"];

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id }).exec();
    // Checking for max mana
    if (user.mana[0] == user.mana[1]) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor(color.primary)
            .addField(":droplet: Maximum mana!", `You already have maximum mana! (${user.mana[0]}/${user.mana[1]})`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }
    
    // Replenishing mana
    const changes = { mana: user.mana };
    const initial = user.mana[0];
    changes.mana[0] = Math.min(initial + replenishMana(user.level), changes.mana[1]);
    await User.updateOne({ id: message.author.id }, { $set: changes }).exec();
    message.channel.send(new Discord.MessageEmbed()
        .setColor(color.primary)
        .addFields(
            { name: ":stars: Meditation successful!", value: `Replenished **${changes.mana[0] - initial} mana points**!`},
            { name: ":droplet: Current Mana", value: `${changes.mana[0]}/${changes.mana[1]}`}
        )
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
    );
    return 1;
}
