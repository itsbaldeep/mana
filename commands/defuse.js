const User = require("../models/User");
const Fragment = require("../models/Fragment");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const remove = require("../functions/remove");

module.exports.cooldown = 4;
module.exports.description = "Using this command, you can convert your current fragments into magicules.";
module.exports.usage = `${prefix}defuse <fragment name>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = async (message, args) => {
    // Validating the argument
    const arg = args.shift();
    if (!arg) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: No arguments found", "Please pass a fragment name.")
        );
        return;
    }

    // Getting the fragment from arguments
    const name = arg[0].toUpperCase() + arg.slice(1) + " Fragment";
    const frag = await Fragment.findOne({ name: name });
    const quantity = parseInt(args.pop()) || 1;

    // Validating the argument
    if (!frag) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to defuse", "Please pass a valid fragment name.")
        );
        return;
    }

    // Getting the user and verifying the quantity
    const user = await User.findOne({ id: message.author.id });
    if (!user.fragments.has(frag._id.toString()) || user.fragments.get(frag._id.toString()) < quantity) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to defuse", `You don't have atleast ${quantity} ${frag.name}(s) in your inventory.`)
        );
        return;
    }

    // Giving magicules and taking fragments
    user.magicule += frag.worth * quantity;
    remove(quantity, frag._id, user.fragments);

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(positive(message.author)
        .addFields(
            { name: `:ring: Defused succesfully`, value: `**Gained**: ${frag.worth * quantity} magicules\n**Current**: ${user.magicule} magicules` },
            { name: ":pencil: Details", value: ` ${frag.worth} magicule each \n${quantity} ${frag.name}(s) defused` },
            { name: ":gem: Magicules", value: `${user.magicule} magicules` }
        )
    );
    return 1;

};
