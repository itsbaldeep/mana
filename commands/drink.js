const Potion = require("../models/Potion");
const Discord = require("discord.js");
const { color } = require("../config.json");
const User = require("../models/User");

module.exports.execute = async (message, args) => {
    // Validating query
    let query = args.join(" ").toLowerCase();
    let name = "";
    if (query == "small" || query == "small mana potion" || query == "small potion") {
        name = "Small Mana Potion";
    } else if (query == "medium" || query == "medium mana potion" || query == "medium potion") {
        name = "Medium Mana Potion";
    } else if (query == "large" || query == "large mana potion" || query == "large potion") {
        name = "Large Mana Potion";
    } else {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Unable to drink!")
            .setDescription("Please pass a valid potion name!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Checking for max mana
    const user = await User.findOne({ id: message.author.id }).exec();
    if (user.mana[0] == user.mana[1]) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor(color)
            .setTitle("Maximum mana!")
            .setDescription(`You already have maximum mana! (${user.mana[0]}/${user.mana[1]})`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Drinking potion
    const pot = await Potion.findOne({ name }).exec();
    let found = false;
    user.items.forEach(async (item, i) => {
        if (item[0] == pot._id.toString() && !found && user.items[i][1] > 0) {
            found = true;
            const changes = {mana: user.mana, items: user.items};
            changes.items[i][1] = changes.items[i][1] - 1;
            const initial = changes.mana[0];
            const newMana = initial + Math.floor(changes.mana[1] * pot.power / 100);
            changes.mana[0] = Math.min(newMana, changes.mana[1]);
            console.log(changes.items);
            await User.updateOne({ id: message.author.id }, { $set: changes }).exec();
            message.channel.send(new Discord.MessageEmbed()
                .setColor(color)
                .setTitle(`Drank ${pot.name} successfully!`)
                .setDescription(`Replenished ${changes.mana[0] - initial} mana points!`)
                .addField(":droplet: Current Mana", `${changes.mana[0]}/${changes.mana[1]}`)
                .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
                .setTimestamp()
            );
        }
    })

    // If user doesn't have the potion
    if (!found) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setDescription(`You don't have ${pot.name} in your inventory!`)
            .setTitle("Potion not found!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }
}
