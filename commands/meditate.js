const Discord = require("discord.js");
const User = require("../models/User");
const { color } = require("../config.json");

module.exports.cooldown = 60;

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id }).exec();
    // Checking for max mana
    if (user.mana[0] == user.mana[1]) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor(color)
            .addField(":droplet: Maximum mana!", `You already have maximum mana! (${user.mana[0]}/${user.mana[1]})`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }
    
    // Replenishing mana
    const changes = { mana: user.mana };
    const initial = user.mana[0];
    const min = user.level;
    const max = user.level * 4 + 40;
    const replenished = Math.floor(Math.random() * (max + min -1)) + min;
    changes.mana[0] = Math.min(initial + replenished, changes.mana[1]);
    await User.updateOne({ id: message.author.id }, { $set: changes }).exec();
    message.channel.send(new Discord.MessageEmbed()
        .setColor(color)
        .addFields(
            { name: ":stars: Meditation successful!", value: `Replenished ${changes.mana[0] - initial} mana points!`},
            { name: ":droplet: Current Mana", value: `${changes.mana[0]}/${changes.mana[1]}`}
        )
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
    );
    return 1;
}
