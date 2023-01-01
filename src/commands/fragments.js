const { prefix } = require("../config.json");
const Fragment = require("../models/Fragment");
const { positive } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "Gives detailed description about all the fragments.";
module.exports.usage = `${prefix}fragments`;
module.exports.aliases = ["frags"];
module.exports.category = "Info";

module.exports.execute = async message => {
    // Getting all fragments
    const fragments = await Fragment.find();

    // Emotes of all Fragments
    const emotes = {
        common: ":sparkles:",
        uncommon: ":star:",
        rare: ":star2:",
        legendary: ":stars:"
    };

    // Building message
    const embed = positive(message.author);
    for (const frag of fragments) {
        let emote;
        if (frag.name == "Common Fragment") emote = emotes.common;
        if (frag.name == "Uncommon Fragment") emote = emotes.uncommon;
        if (frag.name == "Rare Fragment") emote = emotes.rare;
        if (frag.name == "Legendary Fragment") emote = emotes.legendary;
        embed.addField(`${emote} ${frag.name}`, `**Chance**: ${frag.chance}%\n**Worth**: ${frag.worth} magicules`);
    }

    // Sending message
    message.channel.send(embed);
    return 1;
}
