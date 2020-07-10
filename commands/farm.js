const Discord = require("discord.js");
const User = require("../models/User");
const Potion = require("../models/Potion");
const { color } = require("../config.json");

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id }).exec();
    
    // Check for minimum mana
    const m = Math.floor(10 + user.level * 1.1);
    if (user.mana[0] < m * 4) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setTitle("Unable to farm!")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
            .setDescription(`You need atleast **${m * 4} mana** to go farming!`)
            .addField(":drop_of_blood: Replenish Mana", "Meditate or drink potions to replenish your mana!")
        );
        return;
    }

    // Spawn monsters
    const n = Math.ceil(Math.random() * 4);
    const e = 40 * user.level;

    // Keep track of all changes
    const changes = {experience: user.experience, mana: user.mana, level: user.level, items: user.items};
    changes.mana[0] = user.mana[0] - m * n;

    // Check for level up
    let lvlup = false;
    const total = user.experience[1] + e * n;
    const limit = user.experience[0] + 100 * user.level;
    if (total >= limit) {
        lvlup = true;
        changes.experience[0] = limit + 100 * user.level;
        changes.experience[1] = total - limit;
        changes.level = user.level + 1;
        changes.mana[1] = 90 + (user.level + 1) * 10;
        changes.mana[0] = changes.mana[1];
    } else {
        changes.experience[1] = total;
    }

    // Item drop
    const drop = Math.random() < 0.25;
    let pot;
    if (drop) {
        const choose = Math.random();
        if (choose < 0.66) {
            pot = await Potion.findOne({ name: "Small Mana Potion" });
        } else if (choose < 0.88) {
            pot = await Potion.findOne({ name: "Medium Mana Potion" });
        } else {
            pot = await Potion.findOne({ name: "Large Mana Potion" });
        }
        let found = false;
        for (let i = 0; i < changes.items.length; i++) {
            if (changes.items[i][0] == pot._id.toString() && !found && changes.items[i][1] > 0) {
                found = true;
                changes.items[i][1] = changes.items[i][1] + 1;
            }
        }
        if (!found) changes.items.push([pot._id, 1]);
    }

    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
        .addFields(
            { name: ":ghost: Monsters killed", value: `${n} monster(s) found while farming` },
            { name: ":fire: Total experience gained", value: `${e * n} experience points (${e} per monster)` }, 
            { name: ":sweat_drops: Total mana taken", value: `${m * n} mana points (${m} per monster)` },
        );
    await User.updateOne({ id: message.author.id }, { $set: changes }).exec();
    if (lvlup) {
        embed.setTitle("Level Up!").addFields(
            { name: ":star2: Level increased", value: `${changes.level - 1} -> ${changes.level}` },
            { name: ":sparkles: Maximum mana increased", value: `${90 + (changes.level - 1) * 10} -> ${changes.mana[1]}` }
        );
    } else {
        embed.setTitle("Farming done!").addFields(
            { name: ":book: Current Experience", value: user.experience[1] + ` (${user.experience[0] + 100 * user.level} for next level)`},
            { name: ":droplet: Current Mana", value: user.mana[0] + "/" + user.mana[1]},
        );
    }
    if (drop) embed.addField(":bento: Items found", pot.name + " x1");
    message.channel.send(embed);    
}
