const Discord = require("discord.js");
const User = require("../models/User");
const Item = require("../models/Item");
const { prefix, color } = require("../config.json");
const { calculateExp, calculateMana, buryExp } = require("../formulas");

module.exports.cooldown = 8;
module.exports.description = "You can bury bones that you don't need anymore to gain some experience points";
module.exports.usage = `${prefix}bury <bone name> <quantity?>`;
module.exports.aliases = [];

module.exports.execute = async (message, args) => {

    const error = new Discord.MessageEmbed()
        .setColor(color.warning)
        .addField(`:name_badge: Unable to bury`, "Please pass a valid bone name and quantity!")
        .addField(":eyeglasses: Usage", this.usage)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp();

    // Checking if we get any bone name (Every bone is 2 letter)
    if (args.length < 2) {
        message.channel.send(error);
        return;
    }

    // Extracting name and quantity from arguments
    const quantity = args.length == 3 ? args.pop() : 1;
    const name = args.map(ar => ar[0].toUpperCase() + ar.slice(1).toLowerCase()).join(" ");
    const item = await Item.findOne({ name: name });

    // If the item is invalid (Scroll is also handled because it has "of" not "Of")
    if (!item) {
        message.channel.send(error);
        return;
    }

    // Getting user and checking inventory
    const user = await User.findOne({ id: message.author.id });
    const location = { exists: false, index: -1 };
    user.items.forEach((it, index) => {
        if (!location.exists && it[0] == item._id.toString() && it[1] >= quantity) {
            location.exists = true;
            location.index = index;
        }
    });

    if (!location.exists) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor(color.warning)
            .addField(`:name_badge: Unable to bury`, "You don't have enough of that bone to bury!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    const changes = { 
        items: user.items,
        experience: user.experience,
        level: user.level,
        mana: user.mana
    };

    // Removing the item
    changes.items[location.index][1] = changes.items[location.index][1] - quantity;
    const gained = buryExp(item.rarity) * quantity;

    // Checking level up
    let lvlup = false;
    const oldMana = changes.mana[1];
    const total = user.experience[1] + gained;
    const limit = calculateExp(user.experience[0], user.level);
    if (total >= limit) {
        lvlup = true;
        changes.experience[0] = calculateExp(limit, user.level);
        changes.experience[1] = total - limit;
        changes.level = user.level + 1;
        changes.mana[1] = calculateMana(user.level);
        changes.mana[0] = changes.mana[1];
    } else {
        changes.experience[1] = total;
    }

    const embed = new Discord.MessageEmbed()
        .setColor(color.primary)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
        .addFields(
            { name: ":bone: Buried succesfully", value: `${quantity} ${name}(s) got burried!`},
            { name: ":fire: Experience gained", value: `${gained} experience points` }
        )
    if (lvlup) {
        embed.addFields(
            { name: ":star2: Level increased", value: `${user.level} -> ${user.level + 1}` },
            { name: ":sparkles: Maximum mana increased", value: `${oldMana} -> ${changes.mana[1]}` },
            { name: ":book: Current experience", value: user.experience[1] + "/" + calculateExp(user.experience[0], user.level + 1)}
        );
    } else {
        embed.addField(":book: Current experience", user.experience[1] + "/" + calculateExp(user.experience[0], user.level));
    }
    
    await User.updateOne({ id: message.author.id }, { $set: changes });
    message.channel.send(embed);
    return 1;

}