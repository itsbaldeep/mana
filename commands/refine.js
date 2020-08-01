const { prefix } = require("../config.json");
const User = require("../models/User");
const Pet = require("../models/Pet");
const Fragment = require("../models/Fragment");
const Buff = require("../models/Buff");
const { negative, positive } = require("../functions/embed");
const remove = require("../functions/remove");

module.exports.cooldown = 6;
module.exports.description = "Refine your pet and increase the proc rates of your abilities.\n**Takes**: Magicules and Fragments\n**Gives**: New Buffs";
module.exports.usage = `${prefix}refine`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });

    // Checking if user doesn't have a pet
    if (!user.pet) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to refine", "You don't even have a pet to begin with.")
        );
        return;
    }

    // Getting requirements
    const pet = await Pet.findOne({ _id: user.pet });
    const name = pet.rarity + " Fragment";
    const frag = await Fragment.findOne({ name: name });
    let req = 0;
    if (pet.rarity == "Common") req = 25;
    if (pet.rarity == "Uncommon") req = 75;
    if (pet.rarity == "Rare") req = 150;
    if (pet.rarity == "Legendary") req = 300;

    // Validating requirements
    if (user.magicule < req || !user.fragments.has(frag._id.toString())) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to refine", `**Fragment Required**: ${name}\n**Magicules Required**: ${req} magicules`)
        );
        return;
    }

    // Applying new buffs
    const details = new Map();
    for (const key of user.buffs.keys()) {
        // Getting buff and proc rate
        const buff = await Buff.findOne({ name: key });
        let proc = user.buffs.get(key);

        // Setting old and new proc rates
        details.set(key, [proc]);
        if (proc != buff.range.max) user.buffs.set(key, ++proc); 
        details.set(key, details.get(key).concat([proc]));
    }

    // Showing the buffs
    const data = [];
    for (const entry of details.entries())
        data.push(`**${entry[0]}**: ${entry[1][0]} -> ${entry[1][1]}`);

    // Building message
    const embed = positive(message.author)
        .addFields(
            { name: `:dart: ${pet.name} refined`, value: data.join("\n") },
            { name: ":slot_machine: Details", value: `**${name}**: ${user.fragments.get(frag._id.toString())} - 1 = ${user.fragments.get(frag._id.toString()) - 1}\n**Magicules**: ${user.magicule} - ${req} = ${user.magicule - req}` }
        );
    
    // Taking magicules and fragments
    user.magicule -= req;
    remove(1, frag._id, user.fragments);

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;
    
};
