const User = require("../models/User");
const { prefix } = require("../config.json");
const { negative, positive } = require("../functions/embed");

module.exports.cooldown = 16;
module.exports.description = "Replenishes your mana based on your trial level.\n**Gives**: Mana";
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
    const mana = Math.floor(user.trials * 25);

    // Replenishing mana
    user.mana.current = Math.min(mana + user.mana.current, user.mana.limit);

    // Sending message
    message.channel.send(positive(message.author)
        .addField(
            ":comet: Meditation done",
            `**Replenished**: ${user.mana.current - init} mana points\n**Current**: ${user.mana.current}/${user.mana.limit}`
        )
    );
    
    // Updating user
    await User.updateOne({ id: message.author.id }, { $set: user });
    return 1;
};