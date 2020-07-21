const User = require("../models/User");
const Potion = require("../models/Potion");
const Item = require("../models/Item");
const Pet = require("../models/Pet");
const Discord = require("discord.js");
const { prefix, color } = require("../config.json");

const { calculateExp } = require("../formulas");

module.exports.cooldown = 2;
module.exports.description = "Provides basic stats of your profile like your level and current experience and mana points, including a little peek at your items and potions, and also your pet!";
module.exports.usage = `${prefix}profile (@mention)`;
module.exports.aliases = [];

module.exports.execute = async message => {
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    const user = await User.findOne({ id: author.id }).exec();
    
    // Validating if mentioned user exists
    if (!user) {
        message.channel.send(new Discord.MessageEmbed()
        .setColor(color.warning)
        .addField(":name_badge: Unable to show profile!", "The person has no profile and he/she needs to run a command first!")
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
        );
        return;
    }

    const embed = new Discord.MessageEmbed()
        .setColor(color.primary)
        .setThumbnail(author.displayAvatarURL())
        .setAuthor(`${author.username}#${author.discriminator}`, author.displayAvatarURL())
        .setTimestamp()
        .addFields(
            { name: ":crossed_swords: Level", value: user.level },
            { name: ":book: Experience", value: user.experience[1] + "/" + calculateExp(user.experience[0], user.level)},
            { name: ":droplet: Mana", value: user.mana[0] + "/" + user.mana[1]},
    );

    // Check for pet
    if (user.pet) {
        const pet = await Pet.findOne({ _id: user.pet });
        embed.addField(":raccoon: Pet", pet.name);
    }

    const length = {items: 0, potions: 0}
    if (user.items.length > 0)
        length.items = user.items.filter(i => i[1] > 0).length;
    if (user.potions.length > 0)
        length.potions = user.potions.filter(p => p[1] > 0).length;

    if (length.items > 0 || length.potions > 0) {
        const text = [ 
            length.items ? `${length.items} item(s)` : null, 
            length.potions ? `${length.potions} potion(s)` : null
        ].filter(n => n != null).join(" and ");
        embed.addField(":toolbox: Inventory", text);
    }
    message.channel.send(embed);
    return 1;
}
