const { prefix } = require("../config.json");

module.exports.cooldown = 8;
module.exports.description = "Using this command, you can craft higher level potions from your lower level potions.";
module.exports.usage = `${prefix}brew <potion name>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = message => {
    message.channel.send("To be done");
};