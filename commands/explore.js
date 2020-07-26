const { prefix } = require("../config.json");

module.exports.cooldown = 12;
module.exports.description = "By exploring, you are guaranteed to get either a potion or a fragment, it also gives experience and takes fixed mana every level.";
module.exports.usage = `${prefix}explore`;
module.exports.aliases = [];
module.exports.category = "Combat";

module.exports.execute = message => {
    message.channel.send("To be done");
};