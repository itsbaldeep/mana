const Discord = require("discord.js");
const Pet = require("../models/Pet");
const User = require("../models/User");
const Item = require("../models/Item");
const { color } = require("../config.json");

module.exports.cooldown = 5;

module.exports.execute = async (message, args) => {
    // Validating query
    let name = args.shift();
    name = name.charAt(0).toUpperCase() + name.slice(1);
    
    const pet = await Pet.findOne({ name: name });
    if (!pet) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to summon!", "Please pass a valid pet name!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
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
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to summon!", `You already have a pet!`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Checking users inventory
    let bones = []; // [{ item, quantity, index }, ...]
    let scrolls = {}; // { exists, quantity, index }
    user.items.forEach((item, i) => {
        if (arm._id.toString() == item[0]) {
            bones.push({ item: name + " Arm", quantity: item[1], index: i });
        }
        if (leg._id.toString() == item[0]) {
            bones.push({ item: name + " Leg", quantity: item[1], index: i });
        }
        if (chest._id.toString() == item[0]) {
            bones.push({ item: name + " Chest", quantity: item[1], index: i });
        }
        if (skull._id.toString() == item[0]) {
            bones.push({ item: name + " Skull", quantity: item[1], index: i });
        }
        if (scroll._id.toString() == item[0]) {
            scrolls = { exists: true, quantity: item[1], index: i };
        }
    });

    // Remove all the bones with 0 quantity;
    bones = bones.filter(bone => bone.quantity > 0);

    // Check if user has all the bones and atleast 2 arm and legs
    if (bones.length < 4 || bones[0].quantity < 2 || bones[1].quantity < 2) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Unable to summon!", `You don't have enough bones to summon ${name}!`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Checking for legendary pet
    if (pet.rarity == "Legendary" && (!scrolls.exists || scrolls.quantity < 3)) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Insufficient scrolls!", `You need 3 scrolls to summon a legendary pet, and you currently have ${scrolls.quantity}!`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Keeping track of changes
    const changes = { items: user.items, pet: user.pet };
    changes.pet = pet._id;

    // Removing bones from inventory
    bones.forEach((bone, i) => {
        // First two bones are arm and legs that need to be removed twice
        const n = bone.item.includes("Arm") || bone.item.includes("Leg") ? 2 : 1;
        changes.items[bone.index][1] = changes.items[bone.index][1] - n;
    });

    // Remove 3 scrolls if pet is legendary
    if (pet.rarity == "Legendary") {
        changes.items[scrolls.index][1] = changes.items[scrolls.index][1] - 3;
    }

    // Updating the user
    await User.updateOne({ id: message.author.id }, { $set: changes });

    message.channel.send(new Discord.MessageEmbed()
        .setColor(color)
        .addField(`:fire: ${pet.rarity} pet summoned!`, `You have succesfully summoned ${name}!`)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
    );
    return 1;

}
