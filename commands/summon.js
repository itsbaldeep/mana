const Discord = require("discord.js");
const Pet = require("../models/Pet");
const User = require("../models/User");
const Item = require("../models/Item");
const { color } = require("../config.json");

module.exports.cooldown = 1;

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
    const [ arm, leg, chest, skull ] = await Promise.all(reqs);
    
    const user = await User.findOne({ id: message.author.id });

    // Checking users inventory
    let bones = [];
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

    // Keeping track of changes
    const changes = { items: user.items, pet: user.pet };
    changes.pet = pet._id;

    // Removing bones from inventory
    bones.forEach((bone, i) => {
        // First two bones are arm and legs that need to be removed twice
        const n = i < 2 ? 2 : 1;
        changes.items[bone.index][1] = changes.items[bone.index][1] - n;
    });

    // Updating the user
    await User.updateOne({ id: message.author.id }, { $set: changes });

    message.channel.send(new Discord.MessageEmbed()
        .setColor(color)
        .addField(":fire: Pet summoned!", `You have succesfully summoned ${name}!`)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
    );
    return 1;

}
