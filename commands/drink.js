const Potion = require("../models/Potion");
const User = require("../models/User");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");
const remove = require("../functions/remove");

module.exports.cooldown = 8;
module.exports.description = "Drink one potion from your inventory.\n**Takes**: Potion\n**Gives**: Mana";
module.exports.usage = `${prefix}drink <potion name>`;
module.exports.aliases = ["dr"];
module.exports.category = "Combat";

module.exports.execute = async (message, args) => {
    // Getting the potion from arguments
    const name = args.map(a => a[0].toUpperCase() + a.slice(1)).join(" ");
    const pot = await Potion.findOne({ name: name }) || await Potion.findOne({ name: name + " Potion"});

    // Validating the argument
    if (!pot) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to drink", "Please pass a valid potion name.")
        );
        return;
    }

    // Getting the user and verifying the quantity
    const user = await User.findOne({ id: message.author.id });
    if (!user.potions.has(pot._id.toString())) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to drink", "You don't have that potion in your inventory.")
        );
        return;
    }

    // Checking for max mana
    if (user.mana.current == user.mana.limit) {
        message.channel.send(negative(message.author)
            .addField(":droplet: Maximum mana", `You already have maximum mana.`)
        );
        return;
    }

    // Keeping track of initial mana state
    const init = user.mana.current;

    // Calculating mana
    const mana = Math.floor(user.mana.limit * pot.power / 100);

    // Replenishing mana and removing potion
    user.mana.current = Math.min(mana + user.mana.current, user.mana.limit);
    remove(1, pot._id, user.potions);

    // Sending message
    message.channel.send(positive(message.author)
        .addField(
            `:beers: Drank ${pot.name}`,
            `**Replenished**: ${user.mana.current - init} mana points\n**Current**: ${user.mana.current}/${user.mana.limit}`
        )
    );
    
    // Updating user
    await User.updateOne({ id: message.author.id }, { $set: user });
    return 1;

};