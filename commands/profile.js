const User = require("../models/User");
const Pet = require("../models/Pet");
const { prefix } = require("../config.json");

const { calculateExp } = require("../functions/formulas");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "Provides basic stats of your profile like your level and current experience and mana points, including a little peek at your items and potions, and also your pet!";
module.exports.usage = `${prefix}profile (@mention)`;
module.exports.aliases = [];

module.exports.execute = async message => {
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    const user = await User.findOne({ id: author.id }).exec();
    
    // Validating if mentioned user exists
    if (!user) {
        message.channel.send(negativeEmbed(author)
            .addField(":name_badge: Unable to show profile!", "The person has no profile and he/she needs to run a command first!")
        );
        return;
    }

    const embed = positiveEmbed(author)
        .setThumbnail(author.displayAvatarURL())
        .addFields(
            { name: ":crossed_swords: Level", value: user.level },
            { name: ":book: Experience", value: user.experience[1] + "/" + calculateExp(user.experience[0], user.level)},
            { name: ":droplet: Mana", value: user.mana[0] + "/" + user.mana[1]},
    );

    // Check for pet
    if (user.pet) {
        const pet = await Pet.findOne({ _id: user.pet });
        embed.addField(":raccoon: Pet", pet.name);
    }

    const length = {items: 0, potions: 0}
    if (user.items.length > 0)
        length.items = user.items.filter(i => i[1] > 0).length;
    if (user.potions.length > 0)
        length.potions = user.potions.filter(p => p[1] > 0).length;

    if (length.items > 0 || length.potions > 0) {
        const text = [ 
            length.items ? `${length.items} item(s)` : null, 
            length.potions ? `${length.potions} potion(s)` : null
        ].filter(n => n != null).join(" and ");
        embed.addField(":toolbox: Inventory", text);
    }
    message.channel.send(embed);
    return 1;
}
