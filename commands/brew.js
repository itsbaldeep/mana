const User = require("../models/User");
const Potion = require("../models/Potion");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const remove = require("../functions/remove");
const add = require("../functions/add");

module.exports.cooldown = 8;
module.exports.description = "Using this command, you can craft higher level potions from your lower level potions.";
module.exports.usage = `${prefix}brew <potion name>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = async (message, args) => {
    // Validating argument
    const arg = args.shift();
    if (!arg) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: No arguments found", "Please pass a potion name.")
        );
        return;
    }

    // Getting the potion from arguments
    const name = arg[0].toUpperCase() + arg.slice(1) + " Potion";
    const quantity = parseInt(args.pop()) || 1;
    
    // Getting the requirements
    const req = { name: "", quantity: 2 * quantity };
    if (name == "Holy Potion") req.name = "Impure Potion";
    if (name == "Pure Potion") req.name = "Holy Potion";
    if (name == "Divine Potion") req.name = "Pure Potion";
    
    // Validating argument
    if (!req.name) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to brew", "Please pass a valid brewable potion name.")
            .setFooter("Note: You can not brew Impure Potion.")
        );
        return;
    }
    
    // Getting user and validating quantity
    const pot = await Potion.findOne({ name: req.name });
    const user = await User.findOne({ id: message.author.id });
    if (!user.potions.has(pot._id.toString()) || user.potions.get(pot._id.toString()) < quantity) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to brew", `You need atleast ${req.quantity} ${req.name}s to brew ${quantity} ${name}(s).`)
        );
        return;
    }
    
    // Taking the required potions and adding the brewed
    remove(req.quantity, pot._id, user.potions);
    const brewed = await Potion.findOne({ name: name });
    add(quantity, brewed._id, user.potions);

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(positive(message.author)
        .addField(":beer: Brewed succesfully",
        `**Brewed**: ${quantity} ${brewed.name}(s)\n**Spoiled**: ${req.quantity} ${req.name}(s)`
        )
    );
    return 1;

};
