const { prefix } = require("../config.json");

module.exports.cooldown = 4;
module.exports.description = "You can break your current potion into magicules by using this command.";
module.exports.usage = `${prefix}spoil <potion name>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = message => {
    message.channel.send("To be done");
};