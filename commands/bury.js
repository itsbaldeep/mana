const User = require("../models/User");
const Item = require("../models/Item");
const { prefix } = require("../config.json");

const handleLevel = require("../functions/handlelevel");
const { buryExp } = require("../functions/formulas");
const { positiveEmbed, negativeEmbed } = require("../functions/embed");

module.exports.cooldown = 8;
module.exports.description = "You can bury bones that you don't need anymore to gain some experience points";
module.exports.usage = `${prefix}bury <bone name> <quantity?>`;
module.exports.aliases = [];

module.exports.execute = async (message, args) => {

    const error = negativeEmbed(message.author)
        .addField(`:name_badge: Unable to bury`, "Please pass a valid bone name and quantity!")
        .addField(":eyeglasses: Usage", this.usage)

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
        message.channel.send(negativeEmbed(message.author)
            .addField(`:name_badge: Unable to bury`, "You don't have enough of that bone to bury")
        );
        return;
    }

    const changes = user;

    // Removing the item
    changes.items[location.index][1] = changes.items[location.index][1] - quantity;
    const gained = buryExp(item.rarity) * quantity;

    // Checking level up
    const embed = positiveEmbed(message.author)
        .addFields(
            { name: ":bone: Buried succesfully", value: `${quantity} ${name}(s) got buried`},
            { name: ":fire: Experience gained", value: `${gained} experience points` }
        )
    handleLevel(changes, gained, embed);
    
    await User.updateOne({ id: message.author.id }, { $set: changes });
    message.channel.send(embed);
    return 1;

}