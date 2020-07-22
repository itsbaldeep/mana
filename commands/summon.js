const Pet = require("../models/Pet");
const User = require("../models/User");
const Item = require("../models/Item");
const { prefix } = require("../config.json");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "You can summon a pet using this command. You just need 2 arm bones, 2 leg bones, 1 chest bone and 1 skull in your inventory! Also make sure that you have enough scrolls if you want a legendary pet.";
module.exports.usage = `${prefix}summon <pet name>`;
module.exports.aliases = [];

module.exports.execute = async (message, args) => {
    // Validating query
    let name = args.shift();
    name = name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
    const pet = await Pet.findOne({ name: name });
    if (!pet) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to summon", "Please pass a valid pet name")
        );
        return;
    }
    
    // Finding IDs of all required items
    const reqs = [];
    reqs.push(Item.findOne({ name: name + " Arm"}))
    reqs.push(Item.findOne({ name: name + " Leg"}))
    reqs.push(Item.findOne({ name: name + " Chest"}))
    reqs.push(Item.findOne({ name: name + " Skull"}))
    reqs.push(Item.findOne({ name: "Scroll of Mages"}))
    const [ arm, leg, chest, skull, scroll ] = await Promise.all(reqs);
    
    const user = await User.findOne({ id: message.author.id });

    // Checking if user already has pet
    if (user.pet) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to summon", "You already have a pet")
        );
        return;
    }

    // Checking users inventory
    let bones = { arm: {}, leg: {}, chest: {}, skull: {} }; // { quantity, index }
    let scrolls = {}; // { exists, quantity, index }
    user.items.forEach((item, i) => {
        if (arm._id.toString() == item[0]) {
            bones.arm = { quantity: item[1], index: i };
        }
        if (leg._id.toString() == item[0]) {
            bones.leg = { quantity: item[1], index: i };
        }
        if (chest._id.toString() == item[0]) {
            bones.chest = { quantity: item[1], index: i };
        }
        if (skull._id.toString() == item[0]) {
            bones.skull = { quantity: item[1], index: i };
        }
        if (scroll._id.toString() == item[0]) {
            scrolls = { exists: true, quantity: item[1], index: i };
        }
    });

    // Check if user has all the bones and atleast 2 arm and legs
    if (bones.arm.quantity < 2 || bones.leg.quantity < 2 || bones.chest.quantity < 1 || bones.skull.quantity < 1) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to summon", `You don't have enough bones to summon ${name}`)
        );
        return;
    }

    // Checking for legendary pet
    if (pet.rarity == "Legendary" && (!scrolls.exists || scrolls.quantity < 3)) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Insufficient scrolls", `You need 3 scrolls to summon a legendary pet, and you currently have ${scrolls.quantity}`)
        );
        return;
    }

    // Keeping track of changes
    const changes = { items: user.items, pet: user.pet };
    changes.pet = pet._id;

    // Removing bones from inventory
    for (const bone in bones) {
        // First two bones are arm and legs that need to be removed twice
        const n = (bone == "arm" || bone == "leg") ? 2 : 1;
        changes.items[bones[bone].index][1] = changes.items[bones[bone].index][1] - n;
    }

    // Remove 3 scrolls if pet is legendary
    if (pet.rarity == "Legendary") {
        changes.items[scrolls.index][1] = changes.items[scrolls.index][1] - 3;
    }

    // Updating the user
    await User.updateOne({ id: message.author.id }, { $set: changes });
    message.channel.send(positiveEmbed(message.author)
        .addField(`:fire: ${pet.rarity} pet summoned`, `You have succesfully summoned ${name}`)
    );
    return 1;

}
