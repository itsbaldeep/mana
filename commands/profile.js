const { prefix } = require("../config.json");
const { positive, negative } = require("../functions/embed");
const User = require("../models/User");
const Pet = require("../models/Pet");

module.exports.cooldown = 2;
module.exports.description = "Shows experience, mana, levels and magicules of the user.";
module.exports.usage = `${prefix}profile (@user)`;
module.exports.aliases = [];
module.exports.category = "Utility";

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
            .addField(":name_badge: Unable to show profile", "Bots doesn't have a profile.")
        );
        return;
    }

    // Showing basic info
    const embed = positive(author)
        .setThumbnail(author.displayAvatarURL())
        .addFields(
            { name: ":crossed_swords: Level", value: `**Combat level**: ${user.level}\n**Trial level**: ${user.trials}` },
            { name: ":book: Experience", value: `${user.experience.current}/${user.experience.limit}` },
            { name: ":droplet: Mana", value: `${user.mana.current}/${user.mana.limit}` },
            { name: ":gem: Magicules", value: `${user.magicule} magicules` }
    );

    // Check for pet
    if (user.pet) {
        const pet = await Pet.findOne({ _id: user.pet });
        embed.addField(`:raccoon: ${pet.rarity} Pet`, `${pet.name} (${pet.type} Type)`);
    }

    // Send message
    message.channel.send(embed);
    return 1;
};