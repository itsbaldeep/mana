const { prefix } = require("../config.json");

module.exports.cooldown = 8;
module.exports.description = "Share items with your other users.\n**Takes**: From giver\n**Gives**: To taker";
module.exports.usage = `${prefix}share (@user) <item name> <quantity?>`;
module.exports.aliases = [];
module.exports.category = "Utility";

module.exports.execute = message => {
    message.channel.send("To be done");
};