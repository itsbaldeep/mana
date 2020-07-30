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

    // Details of all rarity
    const details = {
        common: { emote: ":sparkles:", cost: 800 },
        uncommon: { emote: ":star:", cost: 1200 },
        rare: { emote: ":star2:", cost: 2400 },
        legendary: { emote: ":stars:", cost: 4200 }
    };

    // Building message
    const embed = positive(message.author);
    for (const set of pets) {
        // Getting info
        let info;
        let rarity = set[0].rarity;
        if (rarity == "Common") info = details.common;
        if (rarity == "Uncommon") info = details.uncommon;
        if (rarity == "Rare") info = details.rare;
        if (rarity == "Legendary") info = details.legendary;

        // Getting pet names
        const names = set.map(pet => pet.name);

        embed.addField(`${info.emote} ${rarity}`, `**Buffs**: ${set[0].abilities}\n**Cost**: ${info.cost} magicules\n**Pets**: ${names.join(", ")}`);
    }

    // Sending message
    message.channel.send(embed);
    return 1;
}
