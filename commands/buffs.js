const { prefix } = require("../config.json");
const Buff = require("../models/Buff");
const { positive } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "Gives detailed description about all the buffs.";
module.exports.usage = `${prefix}buffs`;
module.exports.aliases = [];
module.exports.category = "Info";

module.exports.execute = async message => {
    // Getting all buffs
    const buffs = await Buff.find();

    // Description of all buffs
    const desc = {
        dew: {
            emote: ":sunrise:",
            info: "Chance to recover 100% of mana.",
            proc: "5-35%"
        },
        reversion: {
            emote: ":timer:",
            info: "Chance to take no mana at all.",
            proc: "5-35%"
        },
        grace: {
            emote: ":four_leaf_clover:",
            info: "Reduces overall mana taken.",
            proc: "5-50%"
        },
        lucky: {
            emote: ":sparkler:",
            info: "Increases overall experience gained.",
            proc: "5-50%"
        }
    };

    // Building message
    const embed = positive(message.author);
    for (const buff of buffs) {
        let details;
        if (buff.name == "Morning Dew") details = desc.dew;
        if (buff.name == "Mana Reversion") details = desc.reversion;
        if (buff.name == "Nature's Grace") details = desc.grace;
        if (buff.name == "Lucky Break") details = desc.lucky;
        embed.addField(`${details.emote} ${buff.name}`, `**Detail**: ${details.info}\n**Rate**: ${details.proc}`);
    }

    // Sending message
    message.channel.send(embed);
    return 1;
}
