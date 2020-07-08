const Discord = require("discord.js");
const User = require("../models/User");
const { color } = require("../config.json");

module.exports = {
    execute(message) {
        User.findOne({ id: message.author.id }).exec().then(user => {
            if (!user) {
                message.channel.send(new Discord.MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Unable to meditate!")
                    .setDescription("You need to run ~profile first!")
                );
                return;
            }
            const changes = { mana: user.mana };
            const min = user.level;
            const max = user.level * 4 + 40;
            const replenished = Math.floor(Math.random() * (max - min + 1)) + min;
            changes.mana[0] = Math.max(changes.mana[0] + replenished, changes.mana[1]);
            User.updateOne({ id: message.author.id }, { $set: changes }).exec().then(res => {
                message.channel.send(new Discord.MessageEmbed()
                    .setColor(color)
                    .setTitle("Meditation successful!")
                    .setDescription(`Replenished ${replenished} mana points!`)
                    .addField(":droplet: Current Mana", `${changes.mana[0]}/${changes.mana[1]}`)
                );
            });
        });
    }
}
