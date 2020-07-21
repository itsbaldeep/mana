const User = require("../models/User");
const Pet = require("../models/Pet");
const Discord = require("discord.js");
const { prefix, color } = require("../config.json");

module.exports.cooldown = 2;
module.exports.description = "You can disown your pet if you want a new one, or if you simply don't like your current one.";
module.exports.usage = `${prefix}disown <pet name>`;
module.exports.aliases = [];

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });
    
    // Checking if user doesn't have a pet
    if (!user.pet) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor(color.warning)
            .addField(":name_badge: Unable to disown!", "You don't even have a pet to begin with!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Removing pet
    const pet = await Pet.findOne({ _id: user.pet });
    await User.updateOne({ id: message.author.id }, { $set: { pet: null }});
    message.channel.send(new Discord.MessageEmbed()
        .setColor(color.primary)
        .addField(`:dash: Disowned pet successfully!`, `You no longer own ${pet.name}!`)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
    );
}

