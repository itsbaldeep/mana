const { prefix } = require("../config.json");
const { positive } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "Gives a basic guide on playing this game.";
module.exports.usage = `${prefix}guide`;
module.exports.aliases = [];
module.exports.category = "Info";

module.exports.execute = message => {
    message.channel.send(positive(message.author)
        .addFields(
            { name: ":crossed_swords: Combat and Level", value: "Do farming or exploring to gain experience for your combat level. You can gain even more experience if you have Lucky Grace buff from your Pet. Do trials to increase trial level."  },
            { name: ":droplet: Dealing with Mana", value: "Simple way to replenish mana is by meditating or drinking potions. Boost your meditation by doing trials. Pet buffs can help you even further." },
            { name: ":mag_right: Finding Items", value: "You can get potions, fragments and magicules by farming, exploring or doing trials. Besides that, users can also share items." },
            { name: ":bird: Taming a Pet", value: "Get 10 fragments of any rarity and enough magicules to tame a pet of that same rarity. You can also abandon your pet and get magicules equal to half its cost." },
            { name: ":bowl_with_spoon: Crafting Items", value: "You can craft higher level potions and fragments from their lower level counterparts. Likewise, you can destroy potions or fragments to get magicules equal to their worth." }
        )
    );
    return 1;
}
