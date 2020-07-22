const User = require("../models/User");
const Potion = require("../models/Potion");
const Item = require("../models/Item");
const { prefix } = require("../config.json");

const add = require("../functions/add");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 8;
module.exports.description = "Feeling wholesome? You can share items or potions with your friend easily by using this command!";
module.exports.usage = `${prefix}share @mention <quantity> <item/potion name>`;
module.exports.aliases = [];

module.exports.execute = async (message, args) => {
    const mention = message.mentions.users.first();

    // Validating if a user is mentioned
    if (!mention) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to share", "Please mention a valid user")
        );
        return;
    }

    // Verifying if it isn't a self mention
    if (mention.id == message.author.id) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to share", "You can't give items to yourself")
        );
        return;
    }

    // Getting name and quantity from the message
    args = args.slice(1);
    const quantity = parseInt(args.shift());
    const name = args.join(" ");

    // Validating the quantity
    if (quantity == NaN || !name) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to share", "Please pass a valid number as quantity followed by name of the thing")
        );
        return;
    }

    const giver = await User.findOne({ id: message.author.id });
    const taker = await User.findOne({ id: mention.id });

    // Validating if mentioned user exists
    if (!taker) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to share", "The person has no profile and he/she needs to run a command first")
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
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to share", "Please pass a valid item or potion name")
        );
        return;
    }

    // Keeping track of changes
    const takerChanges = { items: taker.items, potions: taker.potions };
    const giverChanges = { items: giver.items, potions: giver.potions };
    
    // Finding the item and trading
    let found;
    giver.items.forEach((item, i) => {
        if (!found && thing._id.toString() == item[0].toString() && item[1] >= quantity) {
            found = true;
            giverChanges.items[i][1] = giverChanges.items[i][1] - quantity;
            add(takerChanges.items, thing, quantity);
        }
    });
    giver.potions.forEach((potion, i) => {
        if (!found && thing._id.toString() == potion[0].toString()  && potion[1] >= quantity) {
            found = true;
            giverChanges.potions[i][1] = giverChanges.potions[i][1] - quantity;
            add(takerChanges.potions, thing, quantity);
        }
    });

    // If not found
    if (!found) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to share", "You don't have that much of that thing in your inventory")
        );
        return;
    }

    // Updating here
    await User.updateOne({ id: mention.id }, { $set: takerChanges });
    await User.updateOne({ id: message.author.id }, { $set: giverChanges });

    message.channel.send(positiveEmbed(message.author)
        .addField(`:two_women_holding_hands: ${obj.potion ? "Potion" : "Item"} shared with ${mention.username}`, quantity + "x " + thing.name)
    );

    return 1;
}
