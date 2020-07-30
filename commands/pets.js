const { prefix } = require("../config.json");
const Pet = require("../models/Pet");
const { positive } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "Gives detailed description about all the pets.";
module.exports.usage = `${prefix}pets`;
module.exports.aliases = [];
module.exports.category = "Info";

module.exports.execute = async message => {
    // Getting all pets
    const common = await Pet.find({ rarity: "Common" });
    const uncommon = await Pet.find({ rarity: "Uncommon" });
    const rare = await Pet.find({ rarity: "Rare" });
    const legendary = await Pet.find({ rarity: "Legendary" });

    const pets = [common, uncommon, rare, legendary];

    // Emotes of all rarity
    const emotes = {
        common: ":sparkles:",
        uncommon: ":star:",
        rare: ":star2:",
        legendary: ":stars:"
    };

    // Building message
    const embed = positive(message.author);
    for (const set of pets) {
        // Getting emote and rarity
        let emote;
        let rarity = set[0].rarity;
        if (rarity == "Common") emote = emotes.common;
        if (rarity == "Uncommon") emote = emotes.uncommon;
        if (rarity == "Rare") emote = emotes.rare;
        if (rarity == "Legendary") emote = emotes.legendary;

        // Getting pet details
        let details = [];
        for (const pet of set) {
            details.push(`${pet.name} (${pet.type})`);
        }

        embed.addField(`${emote} ${rarity}`, `**Buffs**: ${set[0].abilities}\n${details.join("\n")}`);
    }

    // Sending message
    message.channel.send(embed);
    return 1;
}
