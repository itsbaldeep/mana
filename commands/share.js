const User = require("../models/User");
const Potion = require("../models/Potion");
const Item = require("../models/Item");
const Discord = require("discord.js");
const { prefix, color } = require("../config.json");

module.exports.cooldown = 10;
module.exports.description = "Feeling wholesome? You can share items or potions with your friend easily by using this command!";
module.exports.usage = `${prefix}share @mention <quantity> <item/potion name>`;
module.exports.aliases = [];

module.exports.execute = async (message, args) => {
    const mention = message.mentions.users.first();

    // Validating if a user is mentioned
    if (!mention) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to share!", "Please mention a valid user!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Verifying if it isn't a self mention
    if (mention.id == message.author.id) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to share!", "You can't give items to yourself!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Getting name and quantity from the message
    args = args.slice(1);
    const quantity = args.shift();
    const name = args.join(" ");

    const giver = await User.findOne({ id: message.author.id });
    const taker = await User.findOne({ id: mention.id });

    // Validating if mentioned user exists
    if (!taker) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to share!", "The person has no profile and he/she needs to run a command first!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Finding the item or potion
    const potions = await Potion.find();
    const items = await Item.find();
    const all = potions.concat(items);
    const thing = all.filter(item => item.name.toLowerCase() == name.toLowerCase()).shift();
    
    // Validating if the thing actually exists or not
    if (!thing) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to share!", "Please pass a valid item or potion name!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Checking if user actually has that item
    let found;
    let obj = {};

    // First checking items
    giver.items.forEach((item, i) => {
        if (!found && thing._id.toString() == item[0].toString() && item[1] >= quantity) {
            found = true;
            obj.name = name;
            obj.item = true;
            obj.index = i;
        }
    });

    // Second checking potions
    giver.potions.forEach((potion, i) => {
        if (!found && thing._id.toString() == potion[0].toString()  && potion[1] >= quantity) {
            found = true;
            obj.name = name;
            obj.potion = true;
            obj.index = i;
        }
    });

    if (!found) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to share!", "You don't have that much of that thing in your inventory!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Keeping track of changes
    const takerChanges = { items: taker.items, potions: taker.potions };
    const giverChanges = { items: giver.items, potions: giver.potions };

    // Handling if it's an item
    if (obj.item) {
        giverChanges.items[obj.index][1] = giverChanges.items[obj.index][1] - quantity;
        let found = false;
        for (let i = 0; i < takerChanges.items.length; i++) {
            if (takerChanges.items[i][0] == thing._id.toString() && !found) {
                found = true;
                takerChanges.items[i][1] = takerChanges.items[i][1] + 1;
            }
        }
        if (!found) takerChanges.items.push([thing._id, 1]);
    }

    // Handling if it's a potion
    if (obj.potion) {
        giverChanges.potions[obj.index][1] = giverChanges.potions[obj.index][1] - quantity;
        let found = false;
        for (let i = 0; i < takerChanges.potions.length; i++) {
            if (takerChanges.potions[i][0] == thing._id.toString() && !found) {
                found = true;
                takerChanges.potions[i][1] = takerChanges.potions[i][1] + 1;
            }
        }
        if (!found) takerChanges.potions.push([thing._id, 1]);
    }

    message.channel.send(new Discord.MessageEmbed()
        .setColor(color)
        .addField(`:two_women_holding_hands: ${obj.potion ? "Potion" : "Item"} shared with ${mention.username}`, quantity + "x " + thing.name)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
    );

    // Updating here
    await User.updateOne({ id: mention.id }, { $set: takerChanges });
    await User.updateOne({ id: message.author.id }, { $set: giverChanges });
    return 1;
}
