const { prefix } = require("../config.json");
const { positive, negative } = require("../functions/embed");
const User = require("../models/User");
const Pet = require("../models/Pet");
const Buff = require("../models/Buff");

module.exports.cooldown = 6;
module.exports.description = "Shows details about your pet which includes all the active abilities and their proc rates.";
module.exports.usage = `${prefix}pet (@user)`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = async (message, args) => {
    // Handling arguments
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    let user = await User.findOne({ id: author.id }).exec();
    
    // Checking if mentioned user doesn't have a profile
    if (!user) {
        user = new User({ id: author.id });
        await user.save();
    }

    // Checking if mentioned user is a bot
    if (author.bot) {
        message.channel.send(negative(author)
            .addField(":name_badge: Unable to show pet", "Bots doesn't have a profile.")
        );
        return;
    }

    // Checking if user has a pet
    if (!user.pet) {
        message.channel.send(negative(author)
            .addField(":name_badge: You don't own a pet", "You need to tame a pet first.")
        );
        return;
    }

    // Getting pet and buffs
    const pet = await Pet.findOne({ _id: user.pet });
    const buffs = [];
    for (const id of user.buffs.keys()) {
        const buff = await Buff.findOne({ _id: id });
        buffs.push(`${buff.name} -> ${user.buffs.get(id)}%`);
    }

    // Message
    const embed = positive(author)
        .setThumbnail(author.displayAvatarURL())
        .addFields(
            { name: ":dog: Pet details", value: `**Name**: ${pet.name}\n**Type**: ${pet.type}\n**Rarity**: ${pet.rarity}` },
            { name: ":white_sun_cloud: Buffs", value: buffs.join("\n") }
    );

    // Send message
    message.channel.send(embed);
    return 1;
};
