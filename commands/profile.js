const User = require("../models/User");
const Potion = require("../models/Potion");
const Item = require("../models/Item");
const Pet = require("../models/Pet");
const Discord = require("discord.js");
const { color } = require("../config.json");

const { calculateExp } = require("../formulas");

module.exports.cooldown = 3;

module.exports.execute = async message => {
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    const user = await User.findOne({ id: author.id }).exec();
    
    // Validating if mentioned user exists
    if (!user) {
        message.channel.send(new Discord.MessageEmbed()
        .setColor("#ff0000")
        .addField(":name_badge: Unable to show profile!", "The person has no profile and he/she needs to run a command first!")
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
        );
        return;
    }

    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setThumbnail(author.displayAvatarURL())
        .setAuthor(author.username + "#" + author.discriminator, author.displayAvatarURL())
        .setTimestamp()
        .addFields(
            { name: ":crossed_swords: Level", value: user.level},
            { name: ":book: Experience", value: user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`},
            { name: ":droplet: Mana", value: user.mana[0] + "/" + user.mana[1]},
    );

    // Check for pet
    if (user.pet) {
        const pet = await Pet.findOne({ _id: user.pet });
        embed.addField(":raccoon: Pet", pet.name);
    }

    // Check for inventory
    if (user.potions.length > 0) {
        const pots = [];
        const reqs = [];
        user.potions.forEach(potion => {
            const req = Potion.findOne({ _id: potion[0] });
            reqs.push(req);
        });
        const inv = await Promise.all(reqs);
        inv.forEach((pot, i) => {
            const quantity = user.potions[i][1];
            if (quantity > 0) {
                pots.push(`${pot.name} x${quantity}`);
            }
        });
        if (pots.length > 0) embed.addField(":toolbox: Potions", pots.sort().join('\n'));
    }

    if (user.items.length > 0) {
        let items = [];
        const reqs = [];
        user.items.forEach(item => {
            const req = Item.findOne({ _id: item[0] });
            reqs.push(req);
        });
        const inv = await Promise.all(reqs);
        let limiter = 4;
        inv.forEach((item, i) => {
            const quantity = user.items[i][1];
            if (quantity > 0 && limiter-- > 0) {
                items.unshift(`${item.name} x${quantity}`);
            }
        });
        if (limiter < 0) items.push(`... more`);
        if (items.length > 0) embed.addField(":briefcase: Items", items.join('\n'));
    }

    message.channel.send(embed);
    return 1;
}
