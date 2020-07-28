const User = require("../models/User");
const Potion = require("../models/Potion");
const Fragment = require("../models/Fragment");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const add = require("../functions/add");
const handle = require("../functions/handle.js");

module.exports.cooldown = 2;
module.exports.description = "Trials are level-based tests of your power, they take a large amounts of mana directly related to the trial level and give better better reward each time as well as potions and fragments.";
module.exports.usage = `${prefix}trial`;
module.exports.aliases = [];
module.exports.category = "Combat";

module.exports.execute = async message => {
    // Initializing user
    const user = await User.findOne({ id:message.author.id });

    // Calculating mana and validating
    const mana = user.trials * 50;
    if (user.mana.current < mana) {
        message.channel.send(negative(message.author)
            .addFields(
                { name: `:mag: Trial level ${user.trials}`, value: `You need atleast ${mana} mana points.`},
                { name: ":drop_of_blood: Replenish mana", value: "Meditate or drink potions."}
            )
        );
        return;
    }

    // Giving magicules
    const magicule = user.trials * 10;
    user.magicule += magicule;

    // Taking mana
    user.mana.current -= mana;

    // Building message
    const embed = positive(message.author)
        .addFields(
            { name: `:shield: Trial ${user.trials} done`, value: `**Consumed**: ${mana} mana points\n**Current**: ${user.mana.current}/${user.mana.limit}` },
            { name: ":gem: Magicules", value: `**Found**: ${magicules}\n**Total**: ${user.magicule}` }
        
        );

    // Getting the items
    if (user.trials % 2 == 0) {
        // Get potion
        let name = "";
        const factor = (user.trials / 2) % 4;
        if (factor == 1) name = "Impure Potion";
        if (factor == 2) name = "Holy Potion";
        if (factor == 3) name = "Pure Potion";
        if (factor == 0) name = "Divine Potion";
        const pot = await Potion.findOne({ name: name });
        add(1, pot._id, user.potions);
        embed.addField(":wine_glass: Potion rewarded", pot.name);
    } else {
        // Get fragment
        let name = "";
        const factor = user.trials % 8;
        if (factor == 1) name = "Common Fragment";
        if (factor == 3) name = "Uncommon Fragment";
        if (factor == 5) name = "Rare Fragment";
        if (factor == 7) name = "Legendary Fragment";
        const frag = await Fragment.findOne({ name: name });
        add(1, frag._id, user.fragments);
        embed.addField(":game_die: Fragment rewarded", frag.name);
    }

    // Increasing trial level
    user.trials++;

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: user });
    message.channel.send(embed);
    return 1;
};