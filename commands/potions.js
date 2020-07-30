const { prefix } = require("../config.json");
const Potion = require("../models/Potion");
const { positive } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "Gives detailed description about all the potions.";
module.exports.usage = `${prefix}potions`;
module.exports.aliases = ["pots"];
module.exports.category = "Info";

module.exports.execute = async message => {
    // Getting all potions
    const potions = await Potion.find();

    // Emotes of all potions
    const emotes = {
        impure: ":milk:",
        holy: ":beer:",
        pure: ":tumbler_glass:",
        divine: ":wine_glass:"
    };

    // Building message
    const embed = positive(message.author);
    for (const pot of potions) {
        let emote;
        if (pot.name == "Impure Potion") emote = emotes.impure;
        if (pot.name == "Holy Potion") emote = emotes.holy;
        if (pot.name == "Pure Potion") emote = emotes.pure;
        if (pot.name == "Divine Potion") emote = emotes.divine;
        embed.addField(`${emote} ${pot.name}`, `**Power**: ${pot.power}% mana\n**Chance**: ${pot.chance}%\n**Worth**: ${pot.worth} magicules`);
    }

    // Sending message
    message.channel.send(embed);
    return 1;
}
