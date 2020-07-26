const { prefix } = require("../config.json");

module.exports.cooldown = 12;
module.exports.description = "You can refine your pet by spending some amount of magicules and it will shuffle the buffs and randomize the proc rates which can make your pet better or worse based on luck.";
module.exports.usage = `${prefix}refine`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = message => {
    message.channel.send("To be done");
};