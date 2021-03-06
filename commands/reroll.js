const { prefix } = require("../config.json");
const User = require("../models/User");
const Pet = require("../models/Pet");
const { negative, positive } = require("../functions/embed");
const buffs = require("../functions/buffs");

module.exports.cooldown = 6;
module.exports.description = "Reroll your pet and shuffle abilities and proc rate depending on the rarity.\n**Takes**: Magicules\n**Gives**: New Buffs";
module.exports.usage = `${prefix}reroll`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });

    // Checking if user doesn't have a pet
    if (!user.pet) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to reroll", "You don't even have a pet to begin with.")
        );
        return;
    }

    // Getting requirements
    const pet = await Pet.findOne({ _id: user.pet });
    let req = 0;
    if (pet.rarity == "Common") req = 500;
    if (pet.rarity == "Uncommon") req = 1500;
    if (pet.rarity == "Rare") req = 3000;
    if (pet.rarity == "Legendary") req = 6000;

    // Validating requirements
    if (user.magicule < req) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to reroll", `**Required**: ${req} magicules\n**Current**: ${user.magicule} magicules`)
        );
        return;
    }

    // Getting current buffs
    const current = [];
    for (const entry of user.buffs.entries())
        current.push(`${entry[0]} -> ${entry[1]}`);

    // Taking magicules
    user.magicule -= req;

    // Building message
    const embed = positive(message.author)
        .addFields(
            { name: `:gem: ${pet.name} rerolled`, value: `**Magicules Consumed**: ${req} magicules\n**Current Magicules**: ${user.magicule} magicules` },
            { name: ":white_sun_cloud: Previous buffs", value: current.join("\n") }
        );
    
    // Applying new buffs
    await buffs(user.buffs, pet.abilities, embed);

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;
    
};
