const { prefix } = require("../config.json");
const User = require("../models/User");
const Pet = require("../models/Pet");
const { negative, positive } = require("../functions/embed");
const buffs = require("../functions/buffs");

module.exports.cooldown = 12;
module.exports.description = "You can refine your pet by spending some amount of magicules and it will shuffle the buffs and randomize the proc rates which can make your pet better or worse based on luck.";
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
    let req = 0;
    if (pet.rarity == "Common") req = 50;
    if (pet.rarity == "Uncommon") req = 150;
    if (pet.rarity == "Rare") req = 300;
    if (pet.rarity == "Legendary") req = 600;

    // Validating requirements
    if (user.magicule < req) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to refine", `You need ${req} magicules to refine a ${pet.rarity} pet.`)
        );
        return;
    }

    // Getting buffs
    const current = [];
    for (const entry of user.buffs.entries())
        current.push(`${entry[0]} -> ${entry[1]}`);

    // Building message
    const embed = positive(message.author)
        .addFields(
            { name: `:gem: ${pet.name} refined successfully`, value: `${req} magicules consumed` },
            { name: ":white_sun_cloud: Previous buffs", value: current.join("\n") }
        );
    
    // Taking magicules and getting new buffs
    user.magicules -= req;
    await buffs(user.buffs, pet.abilities, embed);

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;
    
};