const { prefix } = require("../config.json");
const User = require("../models/User");
const Pet = require("../models/Pet");
const Fragment = require("../models/Fragment");
const { positive, negative } = require("../functions/embed");
const add = require("../functions/add");

module.exports.cooldown = 4;
module.exports.description = "Abandon your pet and get fragments of your pet's rarity.\n**Takes**: Your Pet\n**Gives**: Fragments";
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

    // Getting pet and corresponding fragment
    const pet = await Pet.findOne({ _id: user.pet });
    const frag = await Fragment.findOne({ _id: pet.fragment });
    
    // Giving fragments and taking away pet
    user.pet = null;
    add(5, frag._id, user.fragments);
    user.buffs.clear();

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(positive(message.author)
        .addField(`:dash: Disowned ${pet.name}`, `**Gained**: 5 ${frag.name}\n**Total**: ${user.fragments.get(frag._id.toString())} ${frag.name}`)
    );
    return 1;
};
