const User = require("../models/User");
const Fragment = require("../models/Fragment");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const remove = require("../functions/remove");
const add = require("../functions/add");

module.exports.cooldown = 8;
module.exports.description = "Infusing allows you to craft a higher level fragment by using lower level fragment.";
module.exports.usage = `${prefix}infuse <fragment name>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = async (message, args) => {
    // Validating argument
    const arg = args.shift();
    if (!arg) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: No arguments found", "Please pass a fragment name.")
        );
        return;
    }

    // Getting the fragment from arguments
    const name = arg[0].toUpperCase() + arg.slice(1) + " Fragment";
    const quantity = parseInt(args.pop()) || 1;
    
    // Getting the requirements
    const req = { name: "", quantity: quantity };
    if (name == "Uncommon Fragment") { req.name = "Common Fragment"; req.quantity *= 2;}
    if (name == "Rare Fragment") { req.name = "Uncommon Fragment"; req.quantity *= 4;}
    if (name == "Legendary Fragment") { req.name = "Rare Fragment"; req.quantity *= 8;}
    
    // Validating argument
    if (!req.name) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to infuse", "Please pass a valid infusable fragment name.")
            .setFooter("Note: You can not infuse Common Fragment.")
        );
        return;
    }
    
    // Getting user and validating quantity
    const frag = await Fragment.findOne({ name: req.name });
    const user = await User.findOne({ id: message.author.id });
    if (!user.fragments.has(frag._id.toString()) || user.fragments.get(frag._id.toString()) < quantity) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to infuse", `You need atleast ${req.quantity} ${req.name}s to infuse ${quantity} ${name}(s).`)
        );
        return;
    }
    
    // Taking the required fragments and adding the infused
    remove(req.quantity, frag._id, user.fragments);
    const infused = await Fragment.findOne({ name: name });
    add(quantity, infused._id, user.fragments);

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(positive(message.author)
        .addField(":game_die: Infused succesfully",
        `**Infused**: ${quantity} ${infused.name}(s)
        **Defused**: ${req.quantity} ${req.name}(s)`
        )
    );
    return 1;

};
