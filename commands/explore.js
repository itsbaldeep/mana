const User = require("../models/User");

const { prefix } = require("../config.json");
const pickItem = require("../functions/pickitem");
const pickPotion = require("../functions/pickpot");
const handleLevel = require("../functions/handlelevel");
const add = require("../functions/add");
const { exploreExp, exploreMana } = require("../functions/formulas");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 1;
module.exports.description = "Exploring gives you a lot of experience and a guarantee to get either an item or a potion. Though you can't get any legendary item. It takes no mana at all!";
module.exports.usage = `${prefix}explore`;
module.exports.aliases = [];

module.exports.execute = async message => {

    // Initializing user variable and keeping track of changes
    const user = await User.findOne({ id: message.author.id });
    const changes = user;

    const range = `${user.level - (user.level-1) % 5} - ${user.level - (user.level-1) % 5 + 4}`;

    // Checking minimum mana
    const mana = exploreMana(user.level);
    if (user.mana[0] < mana) {
        message.channel.send(negativeEmbed(message.author)
            .addFields(
                { name: `:mag: Exploration Level ${range}`, value: `You need atleast **${mana} mana points** to explore in this level range`},
                { name: ":drop_of_blood: Replenish Mana", value: "Meditate or drink potions to replenish your mana"},
            )
        );
        return;
    }

    // Handle mana and exp
    changes.mana[0] = changes.mana[0] - mana;
    const exp = exploreExp(user.level);

    // Embed to send
    const embed = positiveEmbed(message.author)
        .addField(`:mag: Exploration area ${range}`, `${mana} mana points are consumed`)
        .addField(":earth_americas: Experience gained", `${exp} experience points`);

    handleLevel(changes, exp, embed);

    // Chance to drop potion or item
    if (Math.random() < 0.5) {
        // Making sure there is no legendary item
        async function getItem() {
            const pick = await pickItem();
            if (pick.rarity == "Legendary") return getItem();
            return pick;
        }
        const pick = await getItem();
        add(changes.items, pick.item, 1);
        embed.addField(`:skull_crossbones: ${pick.rarity} item found`, pick.item.name);
    } else {
        // Get a potion
        const pot = await pickPotion();
        add(changes.potions, pot, 1);
        embed.addField(":bento: Potion found", pot.name);
    }

    // Updating user and sending message
    await User.updateOne({ id: message.author.id }, { $set: changes });
    message.channel.send(embed);
    return 1;   
}
