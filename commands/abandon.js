const { prefix } = require("../config.json");
const User = require("../models/User");
const Pet = require("../models/Pet");
const { positive, negative } = require("../functions/embed");

module.exports.cooldown = 4;
module.exports.description = "You can abandon your current pet and convert it into magicules by using this command and passing the pet's name.";
module.exports.usage = `${prefix}abandon`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });
    
    // Checking if user doesn't have a pet
    if (!user.pet) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to disown", "You don't even have a pet to begin with.")
        );
        return;
    }

    // Getting pet and corresponding worth
    const pet = await Pet.findOne({ _id: user.pet });
    const rarity = pet.rarity;
    let magicule = 0;
    if (rarity == "Common") magicule = 400;
    if (rarity == "Uncommon") magicule = 600;
    if (rarity == "Rare") magicule = 1200;
    if (rarity == "Legendary") magicule = 2100;

    // Giving magicules and taking away pet
    user.pet = null;
    user.magicule += magicule;

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(positive(message.author)
        .addField(`:dash: Disowned ${pet.name}`, `**Gained**: ${magicule} magicules\n**Total**: ${user.magicule} magicules`)
    );
    return 1;
};
