const User = require("../models/User");
const Pet = require("../models/Pet");
const Fragment = require("../models/Fragment");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const remove = require("../functions/remove");
const buffs = require("../functions/buffs");

module.exports.cooldown = 4;
module.exports.description = "Tame a new random pet based on the rarity.\n**Takes**: Fragments and Magicules\n**Gives**: Pet";
module.exports.usage = `${prefix}tame <rarity>`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = async (message, args) => {
    
    // Validating if arguments exist
    const arg = args.shift();
    if (!arg) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: No arguments found", "Please pass a rarity.")
        );
        return;
    }

    // Getting the rarity and corresponding fragment from argument
    const rarity = arg[0].toUpperCase() + arg.slice(1);
    const fragname = rarity + " Fragment";

    // Validating the argument
    const frag = await Fragment.findOne({ name: fragname });
    if (!frag) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Invalid argument", "Please pass a valid rarity.")
        );
        return;
    }

    // Calculating requirements
    const req = { magicule: 0, fragment: 10 };
    if (rarity == "Common") req.magicule = 800;
    if (rarity == "Uncommon") req.magicule = 1200;
    if (rarity == "Rare") req.magicule = 2400;
    if (rarity == "Legendary") req.magicule = 4200;

    // Getting user
    const user = await User.findOne({ id: message.author.id });

    // Checking if user already have a pet
    if (user.pet) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to tame", "You already have a pet.")
        );
        return;
    }

    // Validating magicule and fragment requirements
    const count = user.fragments.get(frag._id.toString()) || 0;
    if (user.magicule < req.magicule || count < req.fragment) {
        message.channel.send(negative(message.author)
            .addFields(
                { name: ":name_badge: Unable to tame", value: "You don't have enough resources." },
                { name: ":gem: Magicules", value: `**Required**: ${req.magicule}\n**Current**: ${user.magicule}` },
                { name: `:game_die: ${fragname}`, value: `**Required**: ${req.fragment}\n**Current**: ${count}` }
            )
        );
        return;
    }

    // Getting the pet
    const pets = await Pet.find({ fragment: frag._id });
    const pet = pets[Math.floor(Math.random() * pets.length)];
    user.pet = pet._id;
    
    // Taking away fragments and magicules
    user.magicule -= req.magicule;
    remove(req.fragment, frag._id, user.fragments);

    // Building message
    const embed = positive(message.author)
        .addFields(
            { name: `:star2: Tamed ${pet.name}`, value: `**Type**: ${pet.type}\n**Rarity**: ${pet.rarity}` },
            { name: ":gem: Magicules", value: `**Consumed**: ${req.magicule}\n**Total**: ${user.magicule}` },
            { name: `:game_die: ${fragname}`, value: `**Consumed**: ${req.fragment}\n**Current**: ${count-req.fragment}` }
        );

    // Handling buffs
    await buffs(user.buffs, pet.abilities, embed);
    
    // Sending message and updating user
    await User.updateOne({ id:message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;

};
