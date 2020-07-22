const User = require("../models/User");
const { prefix } = require("../config.json");

const pickItem = require("../functions/pickitem");
const pickPotion = require("../functions/pickpot");
const handleLevel = require("../functions/handlelevel");
const add = require("../functions/add")
const { calculateMobMana, calculateMobExp } = require("../functions/formulas");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "By farming, you can get experience and you have a chance to get an item or a potion. This is the only way to get a legendary bone! It takes you mana, so make sure you have enough mana to farm.";
module.exports.usage = `${prefix}farm`;
module.exports.aliases = [];

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id }).exec();
    const max = 6;
    
    // Check for minimum mana
    const m = calculateMobMana(user.level);
    if (user.mana[0] < m * max) {
        message.channel.send(negativeEmbed(message.author)
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
    const changes = user;

    const embed = positiveEmbed(message.author)
        .addFields(
            { name: ":ghost: Farming done", value: `${n} monster(s) slayed while farming` },
            { name: ":fire: Experience gained", value: `${e * n} experience points` }, 
            { name: ":sweat_drops: Mana consumed", value: `${m * n} mana points` },
        );
    // Taking mana
    changes.mana[0] = changes.mana[0] - m * n;

    // Giving experience
    handleLevel(changes, e * n, embed);

    // Item drop
    if (Math.random() < 0.3) {
        const pick = await pickItem();
        add(changes.items, pick.item, 1);
        embed.addField(`:skull_crossbones: ${pick.rarity} item found`, pick.item.name + " x1");
    }

    // Potion drop
    if (Math.random() < 0.3) {
        const pot = await pickPotion();
        add(changes.potions, pot, 1);
        embed.addField(":bento: Potion found", pot.name + " x1");
    }

    // Sending message and updating user
    await User.updateOne({ id: message.author.id }, { $set: changes });
    message.channel.send(embed);

    return 1;
}
