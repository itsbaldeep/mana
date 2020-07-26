const { prefix } = require("../config.json");

module.exports.cooldown = 8;
module.exports.description = "Infusing allows you to craft a higher level fragment by using lower level fragment.";
module.exports.usage = `${prefix}infuse <fragment name>`;
module.exports.aliases = [];
module.exports.category = "Craft";

module.exports.execute = message => {
    message.channel.send("To be done");
};