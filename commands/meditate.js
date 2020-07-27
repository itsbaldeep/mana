const User = require("../models/User");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");

module.exports.cooldown = 16;
module.exports.description = "Meditating allows you to replenish a large amount of your mana.";
module.exports.usage = `${prefix}meditate`;
module.exports.aliases = ["med"];
module.exports.category = "Combat";

module.exports.execute = async message => {
    const user = await User.findOne({ id: message.author.id });

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
    const mana = Math.floor(Math.random() * user.level * 6 + 50) + user.level;

    // Replenishing mana
    user.mana.current = Math.min(mana + user.mana.current, user.mana.limit);

    // Sending message
    message.channel.send(positive(message.author)
        .addFields(
            { name: ":comet: Replenished mana", value: `${user.mana.current - init} mana points`},
            { name: ":droplet: Current mana", value: `${user.mana.current}/${user.mana.limit}`}
        )
    );
    
    // Updating user
    await User.updateOne({ id: message.author.id }, { $set: user });
    return 1;
};