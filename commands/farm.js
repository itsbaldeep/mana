const User = require("../models/User");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const level = require("../functions/level");
const get = require("../functions/get");
const add = require("../functions/add");

module.exports.cooldown = 12;
module.exports.description = "Farming allows you to farm magicules, a chance to get a potion and/or a fragment, it gives experience and also takes mana depending on how many monsters you encounter.";
module.exports.usage = `${prefix}farm`;
module.exports.aliases = [];
module.exports.category = "Combat";

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });

    // Calculating the percentages
    const min = Math.round(12 - Math.log(user.level + 1));
    const max = min * 4;
    const perc = Math.round(Math.random() * (max - min + 1)) + min;
    
    // Checking minimum mana requirement
    const req = Math.floor(user.mana.limit * max / 100);
    if (user.mana.current < req) {
        message.channel.send(negative(message.author)
        .addFields(
            { name: ":name_badge: Unable to farm", value: `You need ${req} mana points.`},
            { name: ":drop_of_blood: Replenish mana", value: "Meditate or drink potions."}
        )
        );
        return;
    }

    // Calculating mana and experience
    const exp = Math.floor(user.experience.limit * perc / 100);
    const mana = Math.floor(user.mana.limit * perc / 100);

    // Building a message
    const embed = positive(message.author)
        .addFields(
            { name: ":ghost: Slayed monsters", value: `${exp} experience points` },
            { name: ":sweat_drops: Mana consumed", value: `${mana} mana points` }
        );

    // Taking away mana
    user.mana.current -= mana;

    // Giving experience and handling level
    level(user, exp, embed);
    
    // Keeping list of items
    const items = [];

    // Giving magicules to user
    const magicules = Math.round(Math.random() * 30) + 10;
    user.magicule += magicules;
    items.push(`Magicules x${magicules}`);

    // Giving fragment to user
    if (Math.random() < 0.7) {
        const frag = await get.frag();
        add(1, frag._id, user.fragments);
        items.push(`${frag.name} x1`);
    }

    // Giving fragment to user
    if (Math.random() < 0.3) {
        const pot = await get.pot();
        add(1, pot._id, user.potions);
        items.push(`${pot.name} x1`);
    }

    // Showing all items found in the message
    embed.addField(":bento: Spoils of war", items.join("\n"));

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;
};
