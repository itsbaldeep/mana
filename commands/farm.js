const User = require("../models/User");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const curve = require("../functions/curve");
const handle = require("../functions/handle");
const get = require("../functions/get");
const add = require("../functions/add");

module.exports.cooldown = 12;
module.exports.description = "Farming allows you to farm magicules, a chance to get a potion and/or a fragment, it gives experience and also takes mana depending on how many monsters you encounter.";
module.exports.usage = `${prefix}farm`;
module.exports.aliases = [];
module.exports.category = "Combat";

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });
    
    // Checking minimum mana requirement
    const min = curve(user.level);
    const mana = Math.floor(user.mana.limit * min / 50);
    if (user.mana.current < mana) {
        message.channel.send(negative(message.author)
            .addFields(
                { name: ":name_badge: Unable to farm", value: `**Required**: ${mana} mana\n**Current**: ${user.mana.current}/${user.mana.limit}`},
                { name: ":drop_of_blood: Replenish mana", value: "Meditate or drink potions."}
            )
        );
        return;
    }

    // Calculating experience
    const max = min * 2;
    const perc = Math.round(Math.random() * (max - min + 1)) + min;
    const exp = Math.floor(user.experience.limit * perc / 100);

    // Building a message
    const embed = positive(message.author);

    // Giving experience and taking mana
    handle(user, exp, mana, embed);
    
    // Keeping list of items
    const items = [];

    // Giving magicules to user
    const magicules = Math.round(Math.random() * 30) + 10;
    user.magicule += magicules;
    embed.addField(":gem: Magicules", `**Found**: ${magicules}\n**Total**: ${user.magicule}`);

    // Giving fragment to user
    if (Math.random() < 0.4) {
        const frag = await get.frag();
        add(1, frag._id, user.fragments);
        items.push(`${frag.name}`);
    }

    // Giving fragment to user
    if (Math.random() < 0.3) {
        const pot = await get.pot();
        add(1, pot._id, user.potions);
        items.push(`${pot.name}`);
    }

    // Showing all items found in the message
    if (items.length > 0) embed.addField(":bento: Drops", items.join("\n"));

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;
};
