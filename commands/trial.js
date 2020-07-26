const { prefix } = require("../config.json");

module.exports.cooldown = 2;
module.exports.description = "Trials are level-based tests of your power, they take a large amounts of mana directly related to the trial level and give better better reward each time as well as potions and fragments.";
module.exports.usage = `${prefix}trial`;
module.exports.aliases = [];
module.exports.category = "Combat";

module.exports.execute = message => {
    message.channel.send("To be done");
};