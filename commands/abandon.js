const { prefix } = require("../config.json");

module.exports.cooldown = 4;
module.exports.description = "You can abandon your current pet and convert it into magicules by using this command and passing the pet's name.";
module.exports.usage = `${prefix}abandon <pet name>`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = message => {
    message.channel.send("To be done");
};