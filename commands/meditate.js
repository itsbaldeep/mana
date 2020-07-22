const User = require("../models/User");
const { prefix } = require("../config.json");
const { replenishMana } = require("../functions/formulas");
const { positiveEmbed, negativeEmbed } = require("../functions/embed");

module.exports.cooldown = 32;
module.exports.description = "You can meditate to replenish a large portion of your mana!";
module.exports.usage = `${prefix}meditate`;
module.exports.aliases = ["med"];

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id }).exec();
    
    // Checking for max mana
    if (user.mana[0] == user.mana[1]) {
        message.channel.send(negativeEmbed(message.author)
            .addField(":droplet: Maximum mana", `You already have maximum mana (${user.mana[0]}/${user.mana[1]})`)
        );
        return;
    }
    
    // Replenishing mana
    const changes = { mana: user.mana };
    const initial = user.mana[0];
    changes.mana[0] = Math.min(initial + replenishMana(user.level), changes.mana[1]);

    await User.updateOne({ id: message.author.id }, { $set: changes }).exec();
    message.channel.send(positiveEmbed(message.author)
        .addFields(
            { name: ":comet: Replenished mana", value: `${changes.mana[0] - initial} mana points`},
            { name: ":droplet: Current mana", value: `${changes.mana[0]}/${changes.mana[1]}`}
        )
    );

    return 1;
}
