const { prefix } = require("../config.json");

module.exports.cooldown = 4;
module.exports.description = "Given enough magicules and fragments, you can use this command to tame a random pet of the respective rarity that you wish to get.";
module.exports.usage = `${prefix}tame <rarity>`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = message => {
    message.channel.send("To be done");
};