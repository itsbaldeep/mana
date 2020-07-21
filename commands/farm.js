const Discord = require("discord.js");
const User = require("../models/User");
const Potion = require("../models/Potion");
const Item = require("../models/Item");
const { prefix, color } = require("../config.json");
const pickItem = require("../functions/pickitem");

const { calculateMana, calculateExp, calculateMobMana, calculateMobExp, exploreMana } = require("../formulas");
const max = 6;

module.exports.cooldown = 8;
module.exports.description = "By farming, you can get experience and you have a chance to get an item or a potion. This is the only way to get a legendary bone! It takes you mana, so make sure you have enough mana to farm.";
module.exports.usage = `${prefix}farm`;
module.exports.aliases = [];

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id }).exec();
    const findRange = level => `${level - (level-1) % 5} - ${level - (level-1) % 5 + 4}`;
    
    // Check for minimum mana
    const m = calculateMobMana(user.level);
    if (user.mana[0] < m * max) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor(color.warning)
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
    const changes = {
        experience: user.experience,
        mana: user.mana,
        level: user.level,
        potions: user.potions,
        items: user.items
    };
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

    // Potion drop
    const dropPotion = Math.random() < 0.3;
    let pot;
    if (dropPotion) {
        const choose = Math.random();
        if (choose < 0.66) {
            pot = await Potion.findOne({ name: "Small Mana Potion" });
        } else if (choose < 0.88) {
            pot = await Potion.findOne({ name: "Medium Mana Potion" });
        } else {
            pot = await Potion.findOne({ name: "Large Mana Potion" });
        }
        let found = false;
        for (let i = 0; i < changes.potions.length; i++) {
            if (changes.potions[i][0] == pot._id.toString() && !found && changes.potions[i][1] > 0) {
                found = true;
                changes.potions[i][1] = changes.potions[i][1] + 1;
            }
        }
        if (!found) changes.potions.push([pot._id, 1]);
    }

    // Item drop
    const dropItem = Math.random() < 0.3;
    let item, itemRarity;
    if (dropItem) {
        const pick = pickItem();
        itemRarity = pick.rarity;
        item = await Item.findOne({ name: pick.picked });
        let found = false;
        for (let i = 0; i < changes.items.length; i++) {
            if (changes.items[i][0] == item._id.toString() && !found && changes.items[i][1] > 0) {
                found = true;
                changes.items[i][1] = changes.items[i][1] + 1;
            }
        }
        if (!found) changes.items.push([item._id, 1]);
    }

    const embed = new Discord.MessageEmbed()
        .setColor(color.primary)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
        .addFields(
            { name: ":ghost: Farming done", value: `${n} monster(s) slayed while farming` },
            { name: ":fire: Experience gained", value: `${e * n} experience points` }, 
            { name: ":sweat_drops: Mana consumed", value: `${m * n} mana points` },
        );
    if (lvlup) {
        if ((user.level + 1) % 5 == 1)
            embed.addField(`:palm_tree: New exploration area ${findRange(user.level + 1)}`, `Exploring will now take ${exploreMana(user.level + 1)} mana points!`)
        embed.addFields(
            { name: ":star2: Level increased", value: `${user.level} -> ${user.level + 1}` },
            { name: ":sparkles: Maximum mana increased", value: `${oldMana} -> ${changes.mana[1]}` },
            { name: ":book: Current experience", value: user.experience[1] + "/" + calculateExp(user.experience[0], user.level + 1)}
        );
    } else {
        embed.addFields(
            { name: ":book: Current experience", value: user.experience[1] + "/" + calculateExp(user.experience[0], user.level)},
            { name: ":droplet: Current mana", value: user.mana[0] + "/" + user.mana[1]},
        );
    }
    if (dropPotion) embed.addField(":bento: Potion found", pot.name + " x1");
    if (dropItem) embed.addField(`:skull_crossbones: ${itemRarity} item found`, item.name + " x1");
    message.channel.send(embed);
    User.updateOne({ id: message.author.id }, { $set: changes }).exec();
    return 1;
}
