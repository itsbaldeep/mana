const { prefix } = require("../config.json");

module.exports.cooldown = 8;
module.exports.description = "Use this command to drink potions that are in your inventory.";
module.exports.usage = `${prefix}drink <potion name>`;
module.exports.aliases = [];
module.exports.category = "Combat";

module.exports.execute = message => {
    message.channel.send("To be done");
};