const { prefix } = require("../config.json");

module.exports.cooldown = 8;
module.exports.description = "You can share magicules, potions and fragments with your friends by using this command. Be careful of the syntax though.";
module.exports.usage = `${prefix} (@user) <quantity> <item name>`;
module.exports.aliases = [];
module.exports.category = "Utility";

module.exports.execute = message => {
    message.channel.send("To be done");
};