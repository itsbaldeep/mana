const { prefix } = require("../config.json");

module.exports.cooldown = 4;
module.exports.description = "Using this command, you can convert your current fragments into magicules.";
module.exports.usage = `${prefix}defuse <fragment name>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = message => {
    message.channel.send("To be done");
};