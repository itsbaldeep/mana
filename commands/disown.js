const User = require("../models/User");
const Pet = require("../models/Pet");
const { prefix } = require("../config.json");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "You can disown your pet if you want a new one, or if you simply don't like your current one.";
module.exports.usage = `${prefix}disown <pet name>`;
module.exports.aliases = [];

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });
    
    // Checking if user doesn't have a pet
    if (!user.pet) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to disown!", "You don't even have a pet to begin with!")
        );
        return;
    }

    // Removing pet
    const pet = await Pet.findOne({ _id: user.pet });
    await User.updateOne({ id: message.author.id }, { $set: { pet: null }});
    message.channel.send(positiveEmbed(message.author)
        .addField(`:dash: Disowned pet successfully!`, `You no longer own ${pet.name}!`)
    );
}

