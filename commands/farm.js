const Discord = require("discord.js");
const User = require("../models/User");
const Potion = require("../models/Potion");
const { color } = require("../config.json");

const { calculateMana, calculateExp, calculateMobMana, calculateMobExp } = require("../formulas");
const max = 6;

module.exports.cooldown = 0;

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id }).exec();
    
    // Check for minimum mana
    const m = calculateMobMana(user.level);
    if (user.mana[0] < m * max) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
            .addFields(
                { name: ":name_badge: Unable to farm!", value: `You need atleast **${m * max} mana** to go farming!`},
                { name: ":drop_of_blood: Replenish Mana", value: "Meditate or drink potions to replenish your mana!"}
            )
        );
        return;
    }

    // Spawn monsters
    const n = Math.ceil(Math.random() * max);
    const e = calculateMobExp(user.level);

    // Keep track of all changes
    const changes = {experience: user.experience, mana: user.mana, level: user.level, items: user.items};
    changes.mana[0] = user.mana[0] - m * n;
    const oldMana = user.mana[1];

    // Check for level up
    let lvlup = false;
    const total = user.experience[1] + e * n;
    const limit = calculateExp(user.experience[0], user.level);
    if (total >= limit) {
        lvlup = true;
        changes.experience[0] = calculateExp(limit, user.level);
        changes.experience[1] = total - limit;
        changes.level = user.level + 1;
        changes.mana[1] = calculateMana(user.level);
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
            { name: ":star2: Farming done!", value: `${n} monster(s) found while farming` },
            { name: ":fire: Total experience gained", value: `${e * n} experience points (${e} per monster)` }, 
            { name: ":sweat_drops: Total mana taken", value: `${m * n} mana points (${m} per monster)` },
        );
    if (lvlup) {
        embed.addFields(
            { name: ":star2: Level Up!", value: `${user.level} -> ${user.level + 1}` },
            { name: ":sparkles: Maximum mana increased", value: `${oldMana} -> ${changes.mana[1]}` },
            { name: ":book: Current Experience", value: user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`}
        );
    } else {
        embed.addFields(
            { name: ":book: Current Experience", value: user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`},
            { name: ":droplet: Current Mana", value: user.mana[0] + "/" + user.mana[1]},
        );
    }
    if (drop) embed.addField(":bento: Items found", pot.name + " x1");
    message.channel.send(embed);
    User.updateOne({ id: message.author.id }, { $set: changes }).exec();
    return 1;
}
