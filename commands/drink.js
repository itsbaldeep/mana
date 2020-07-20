const Potion = require("../models/Potion");
const Discord = require("discord.js");
const User = require("../models/User");
const { prefix, color } = require("../config.json");

module.exports.cooldown = 30;
module.exports.description = "If you are low on mana and you have a potion in your inventory, then you can drink that potion to replenish your mana!";
module.exports.usage = `${prefix}drink <potion name>`;
module.exports.aliases = [];

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
            .addField(":name_badge: Unable to drink!", "Please pass a valid potion name!")
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
            .addField(":droplet: Maximum mana!", `You already have maximum mana! (${user.mana[0]}/${user.mana[1]})`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }

    // Drinking potion
    const pot = await Potion.findOne({ name }).exec();
    let found = false;
    user.potions.forEach(async (potion, i) => {
        if (potion[0] == pot._id.toString() && !found && potion[1] > 0) {
            found = true;
            const changes = {mana: user.mana, potions: user.potions};
            changes.potions[i][1] = changes.potions[i][1] - 1;
            const initial = changes.mana[0];
            const newMana = initial + Math.floor(changes.mana[1] * pot.power / 100);
            changes.mana[0] = Math.min(newMana, changes.mana[1]);
            await User.updateOne({ id: message.author.id }, { $set: changes }).exec();
            message.channel.send(new Discord.MessageEmbed()
                .setColor(color)
                .addFields(
                    { name: `:wine_glass: Drank ${pot.name} successfully!`, value: `Replenished ${changes.mana[0] - initial} mana points!` },
                    { name: ":droplet: Current Mana", value: `${changes.mana[0]}/${changes.mana[1]}`}
                )
                .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
                .setTimestamp()
            );
        }
    })

    // If user doesn't have the potion
    if (!found) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .addField(":name_badge: Potion not found!", `You don't have ${pot.name} in your inventory!`)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
        return;
    }
    return 1;
}
