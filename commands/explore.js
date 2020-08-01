const User = require("../models/User");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const curve = require("../functions/curve");
const handle = require("../functions/handle");
const get = require("../functions/get");
const add = require("../functions/add");

module.exports.cooldown = 12;
module.exports.description = "Explore for items in your surroundings based on your combat level.\n**Takes**: Mana\n**Gives**: Experience, Potion and/or Fragment";
module.exports.usage = `${prefix}explore`;
module.exports.aliases = [];
module.exports.category = "Combat";

module.exports.execute = async message => {
    // Initilizing user
    const user = await User.findOne({ id: message.author.id });

    // Handling mana cost and validating
    const mana = Math.floor(user.mana.limit * 15 / 100);
    if (user.mana.current < mana) {
        message.channel.send(negative(message.author)
            .addFields(
                { name: `:mag: Combat level ${user.level}`, value: `**Required**: ${mana} mana\n**Current**: ${user.mana.current}/${user.mana.limit}`},
                { name: ":drop_of_blood: Replenish mana", value: "Meditate or drink potions."}
            )
        );
        return;
    }

    // Handling experience gained
    const perc = 3 * curve(user.level);
    const exp = Math.floor(user.experience.limit * perc / 100);

    // Building a message
    const embed = positive(message.author);

    // Adding experience and taking mana
    handle(user, exp, mana, embed);

    // Handling items
    if (Math.random() < 0.5) {
        // Give a fragment
        const frag = await get.frag();
        add(1, frag._id, user.fragments);
        embed.addField(":game_die: Fragment found", frag.name);
    } else {
        // Give a potion
        const pot = await get.pot();
        add(1, pot._id, user.potions);
        embed.addField(":wine_glass: Potion found", pot.name);
    }

    // Giving magicules to user
    const magicules = user.level * 10;
    user.magicule += magicules;
    embed.addField(":gem: Magicules", `**Found**: ${magicules}\n**Total**: ${user.magicule}`);
    
    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;

};