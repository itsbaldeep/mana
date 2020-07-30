const User = require("../models/User");
const Potion = require("../models/Potion");
const Fragment = require("../models/Fragment");
const { prefix } = require("../config.json");

const add = require("../functions/add");
const remove = require("../functions/remove");
const { negative, positive } = require("../functions/embed");

module.exports.cooldown = 8;
module.exports.description = "Share fragments, potions and magicules with other users.";
module.exports.usage = `${prefix}share (@user) <item> <quantity?>`;
module.exports.aliases = [];

module.exports.execute = async (message, args) => {
    const mention = message.mentions.users.first();

    // Validating if a user is mentioned
    if (!mention) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to share", "Please mention a valid user.")
        );
        return;
    }

    // Verifying if it isn't a self mention
    if (mention.id == message.author.id) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to share", "You can't give items to yourself.")
        );
        return;
    }
    
   // Checking if mentioned user is a bkt
   if (mention.bot) {
        message.channel.send(negative(author)
            .addField(":name_badge: Unable to share items", "Bots doesn't have a profile.")
        );
        return;
    }
    
    // Validating argument
    const arg = args.shift().shift();
    if (!arg) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: No arguments found", "Please pass an item name.")
        );
        return;
    }

    // Getting name and quantity
    const name = arg[0].toUpperCase() + arg.slice(1);
    const quantity = parseInt(args.pop()) || 1;
    
    // Getting giver and taker's user profiles
    const giver = await User.findOne({ id: message.author.id });
    let taker = await User.findOne({ id: mention.id });
    
    // Validating if mentioned user exists
    if (!taker) {
        taker = new User();
        await taker.save();
    }
    
    // Finding the item
    let item;
    if (name == "Impure" || name == "Holy" || name == "Pure" || name == "Divine") {
        // Case of potions
        item = name + " Potion";
        const potions = await Potion.find();
        const pot = potions.filter(p => p.name == item).shift();
        if (!giver.potions.has(pot.id.toString()) || giver.potions.get(pot._id.toString()) < quantity) {
            message.channel.send(negative(message.author)
                .addField(":name_badge: Unable to share", `You don't have enough ${item} to share.`)
            );
            return;
        }
        
        // Adding and removing appropriately
        remove(quantity, pot._id, giver.potions);
        add(quantity, pot._id, taker.potions);
    }
    else if (name == "Common" || name == "Uncommon" || name == "Rare" || name == "Legendary") {
        // Case of fragments
        item = name + " Fragment";
        const fragments = await Fragment.find();
        const frag = fragments.filter(f => f.name == item).shift();
        if (!giver.fragments.has(frag._id.toString()) || giver.fragments.get(frag._id.toString()) < quantity) {
            message.channel.send(negative(message.author)
                .addField(":name_badge: Unable to share", `You don't have enough ${item} to share.`)
            );
            return;
        }
        
        // Adding and removing appropriately
        remove(quantity, frag._id, giver.fragments);
        add(quantity, frag._id, taker.fragments);
    }
    else if (name.startsWith("Magicule")) {
        // Case of magiculez
        item = "Magicules";
        if (giver.magicule < quantity) { 
            message.channel.send(negative(message.author)
                .addField(":name_badge: Unable to share", `You don't have enough magicules to share.`)
            );
            return;
        }
        
        // Adding and removing appropriately
        giver.magicule -= quantity;
        taker.magicule += quantity;
    }  
    else {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to share", "Please pass a valid item name.")
        );
        return;
    }

    // Updating users and sending message
    await User.updateOne({ id: mention.id }, { $set: taker });
    await User.updateOne({ id: message.author.id }, { $set: giver });
    message.channel.send(positive(message.author)
        .addField(`Shared successfully`, `**Given**: ${name} x${quantity}\n**To**: ${mention.username}`)
    );
    return 1;
}
