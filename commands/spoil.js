const User = require("../models/User");
const Potion = require("../models/Potion");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const remove = require("../functions/remove");

module.exports.cooldown = 4;
module.exports.description = "Spoil your potions into magicules.\n**Takes**: Potions\n**Gives**: Magicules";
module.exports.usage = `${prefix}spoil <potion name> <quantity?>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = async (message, args) => {
    // Validating the argument
    const arg = args.shift();
    if (!arg) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: No arguments found", "Please pass a potion name.")
        );
        return;
    }

    // Getting the potion from arguments
    const name = arg[0].toUpperCase() + arg.slice(1) + " Potion";
    const pot = await Potion.findOne({ name: name });
    const quantity = parseInt(args.pop()) || 1;

    // Validating the argument
    if (!pot) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to spoil", "Please pass a valid potion name.")
        );
        return;
    }

    // Getting the user and verifying the quantity
    const user = await User.findOne({ id: message.author.id });
    if (!user.potions.has(pot._id.toString()) || user.potions.get(pot._id.toString()) < quantity) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to spoil", `You don't have atleast ${quantity} ${pot.name}(s) in your inventory.`)
        );
        return;
    }

    // Giving magicules and taking potions
    user.magicule += pot.worth * quantity;
    remove(quantity, pot._id, user.potions);

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(positive(message.author)
        .addFields(
            { name: `:ring: Spoiled succesfully`, value: `**Gained**: ${pot.worth * quantity} magicules\n**Total**: ${user.magicule} magicules` },
            { name: ":pencil: Details", value: `**Spoiled**: ${quantity} ${pot.name}\n**Worth**: ${pot.worth} magicule each` },
        )
    );
    return 1;

};
