const { prefix } = require("../config.json");

module.exports.cooldown = 6;
module.exports.description = "Shows details about your pet which includes all the active abilities and their proc rates.";
module.exports.usage = `${prefix}pet (@user)`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = message => {
    message.channel.send("To be done");
};