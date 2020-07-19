const Discord = require("discord.js");
const User = require("../models/User");
const Item = require("../models/Item");
const Potion = require("../models/Potion");
const { color } = require("../config.json");
const pickItem = require("../functions/pickitem");
const { exploreExp, calculateExp, calculateMana } = require("../formulas");

module.exports.cooldown = 20;

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });
    const changes = { 
        level: user.level, 
        experience: user.experience,
        mana: user.mana,
        potions: user.potions,
        items: user.items 
    };

    // Get a uncommon or common or rare item
    function getItem() {
        const pick = pickItem();
        if (pick.rarity == "Legendary" || pick.rarity == "Scroll") {
            return getItem();
        }
        return pick;
    }
    const pick = getItem();
    const item = await Item.findOne({ name: pick.picked });

    // Get a potion
    let pot;
    const choose = Math.random();
    if (choose < 0.66) {
        pot = await Potion.findOne({ name: "Small Mana Potion" });
    } else if (choose < 0.88) {
        pot = await Potion.findOne({ name: "Medium Mana Potion" });
    } else {
        pot = await Potion.findOne({ name: "Large Mana Potion" });
    }

    // Handle experience
    const exp = exploreExp(user.level);

    // Check for level up
    let lvlup = false;
    const total = user.experience[1] + exp;
    const limit = calculateExp(user.experience[0], user.level);
    const oldMana = user.mana[1];
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

    // Putting that item in user's profile
    let found = false;
    for (let i = 0; i < changes.items.length; i++) {
        if (changes.items[i][0] == item._id.toString() && !found && changes.items[i][1] > 0) {
            found = true;
            changes.items[i][1] = changes.items[i][1] + 1;
        }
    }
    if (!found) changes.items.push([item._id, 1]);
    
    // Putting potion
    found = false;
    for (let i = 0; i < changes.potions.length; i++) {
        if (changes.potions[i][0] == pot._id.toString() && !found && changes.potions[i][1] > 0) {
            found = true;
            changes.potions[i][1] = changes.potions[i][1] + 1;
        }
    }
    if (!found) changes.potions.push([pot._id, 1]);

    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
        .addField(":earth_americas: Exploring finished!", `Gained ${exp} experience points`)
        .addField(":bento: Potion found!", pot.name)
        .addField(`:skull_crossbones: ${pick.rarity} item found!`, pick.picked)

    if (lvlup) {
        embed.addFields(
            { name: ":star2: Level Up!", value: `${user.level} -> ${user.level + 1}` },
            { name: ":sparkles: Maximum mana increased", value: `${oldMana} -> ${changes.mana[1]}` },
            { name: ":book: Current Experience", value: user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`}
        );
    } else {
        embed.addField(":book: Current Experience", user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`)
    }

    await User.updateOne({ id: message.author.id }, { $set: changes });
    message.channel.send(embed);
    return 1;   
}
