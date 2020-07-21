const Discord = require("discord.js");
const User = require("../models/User");
const Item = require("../models/Item");
const Potion = require("../models/Potion");
const { prefix, color } = require("../config.json");
const pickItem = require("../functions/pickitem");
const { exploreExp, calculateExp, calculateMana, exploreMana } = require("../formulas");

module.exports.cooldown = 12;
module.exports.description = "Exploring gives you a lot of experience and a guarantee to get either an item or a potion. Though you can't get any legendary item. It takes no mana at all!";
module.exports.usage = `${prefix}explore`;
module.exports.aliases = [];

module.exports.execute = async message => {

    // Initializing user variable and keeping track of changes
    const user = await User.findOne({ id: message.author.id });
    const changes = { 
        level: user.level, 
        experience: user.experience,
        mana: user.mana,
        potions: user.potions,
        items: user.items 
    };

    // Checking minimum mana
    const findRange = level => `${level - (level-1) % 5} - ${level - (level-1) % 5 + 4}`;
    const range = findRange(user.level);
    const mana = exploreMana(user.level);
    if (user.mana[0] < mana) {
        message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
            .addFields(
                { name: `:mag: Exploration Level ${range}`, value: `You need atleast ${mana} mana points to explore in this level range`},
                { name: ":name_badge: Unable to explore!", value: "You have insufficient mana to explore" },
                { name: ":drop_of_blood: Replenish Mana", value: "Meditate or drink potions to replenish your mana!"},
            )
        );
        return;
    }

    // If drop is true, give bone, else potion
    const drop = Math.random() < 0.5;

    let pot;
    let pick;

    if (drop) {
        // Making sure there is no legendary item
        function getItem() {
            const pick = pickItem();
            if (pick.rarity == "Legendary") return getItem();
            return pick;
        }
        pick = getItem();
        const item = await Item.findOne({ name: pick.picked });

        // Putting that item in user's profile
        let found = false;
        for (let i = 0; i < changes.items.length; i++) {
            if (changes.items[i][0] == item._id.toString() && !found && changes.items[i][1] > 0) {
                found = true;
                changes.items[i][1] = changes.items[i][1] + 1;
            }
        }
        if (!found) changes.items.push([item._id, 1]);
    } else {
        // Get a potion
        const choose = Math.random();
        if (choose < 0.66) {
            pot = await Potion.findOne({ name: "Small Mana Potion" });
        } else if (choose < 0.88) {
            pot = await Potion.findOne({ name: "Medium Mana Potion" });
        } else {
            pot = await Potion.findOne({ name: "Large Mana Potion" });
        }

        // Putting potion
        let found = false;
        for (let i = 0; i < changes.potions.length; i++) {
            if (changes.potions[i][0] == pot._id.toString() && !found && changes.potions[i][1] > 0) {
                found = true;
                changes.potions[i][1] = changes.potions[i][1] + 1;
            }
        }
        if (!found) changes.potions.push([pot._id, 1]);
    }

    // Handle mana
    changes.mana[0] = changes.mana[0] - mana;
    
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

    // Embed to send
    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
        .setTimestamp()
        .addField(`:mag: Exploration Level ${range}`, `${mana} mana points are consumed`)
        .addField(":earth_americas: Exploring finished", `Gained ${exp} experience points`);

    // Add field according to the drop rate
    if (!drop) embed.addField(":bento: Potion found!", pot.name);
    else embed.addField(`:skull_crossbones: ${pick.rarity} item found!`, pick.picked);

    // Add fields if user is levelled up
    if (lvlup) {
        if ((user.level + 1) % 5 == 1)
            embed.addField(`:palm_tree: Entered a new exploration level ${findRange(user.level)}`, `Exploring will now take ${mana} mana points!`)
        embed.addFields(
            { name: ":star2: Level increased", value: `${user.level} -> ${user.level + 1}` },
            { name: ":sparkles: Maximum mana increased", value: `${oldMana} -> ${changes.mana[1]}` },
            { name: ":book: Current Experience", value: user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`}
        );
    } else {
        embed.addFields(
            { name: ":book: Current Experience", value: user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`},
            { name: ":droplet: Current Mana", value: user.mana[0] + "/" + user.mana[1]}
        )
        
    }

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: changes });
    message.channel.send(embed);
    return 1;   
}
