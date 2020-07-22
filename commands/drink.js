const Potion = require("../models/Potion");
const User = require("../models/User");

const { prefix } = require("../config.json");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 16;
module.exports.description = "If you are low on mana and you have a potion in your inventory, then you can drink that potion to replenish your mana!";
module.exports.usage = `${prefix}drink <potion name>`;
module.exports.aliases = [];

module.exports.execute = async (message, args) => {
    // Validating query
    let query = args.join(" ").toLowerCase();
    let name = "";
    if (query == "small" || query == "small mana potion" || query == "small potion") {
        name = "Small Mana Potion";
    } else if (query == "medium" || query == "medium mana potion" || query == "medium potion") {
        name = "Medium Mana Potion";
    } else if (query == "large" || query == "large mana potion" || query == "large potion") {
        name = "Large Mana Potion";
    } else {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Unable to drink", "Please pass a valid potion name")
        );
        return;
    }

    // Checking for max mana
    const user = await User.findOne({ id: message.author.id }).exec();
    if (user.mana[0] == user.mana[1]) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":droplet: Maximum mana", `You already have maximum mana (${user.mana[0]}/${user.mana[1]})`)
        );
        return;
    }

    // Drinking potion
    const pot = await Potion.findOne({ name }).exec();
    let found = false;
    user.potions.forEach(async (potion, i) => {
        if (!found && potion[0] == pot._id.toString() && potion[1] > 0) {
            found = true;
            const changes = {mana: user.mana, potions: user.potions};
            changes.potions[i][1] = changes.potions[i][1] - 1;
            const initial = changes.mana[0];
            const newMana = initial + Math.floor(changes.mana[1] * pot.power / 100);
            changes.mana[0] = Math.min(newMana, changes.mana[1]);
            await User.updateOne({ id: message.author.id }, { $set: changes }).exec();
            message.channel.send(positiveEmbed(message.author)
                .addFields(
                    { name: `:wine_glass: Drank ${pot.name}`, value: `${changes.mana[0] - initial} mana points` },
                    { name: ":droplet: Current mana", value: `${changes.mana[0]}/${changes.mana[1]}`}
                )
            );
        }
    });

    // If user doesn't have the potion
    if (!found) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":name_badge: Potion not found", `You don't have ${pot.name} in your inventory`)
        );
        return;
    }

    return 1;
}
