const User = require("../models/User");
const Fragment = require("../models/Fragment");
const Potion = require("../models/Potion");
const { prefix } = require("../config.json");
const { positive, negative } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "It shows total amount of user's potions, fragments and magicules.";
module.exports.usage = `${prefix}inventory (@user)`;
module.exports.aliases = ["inv"];
module.exports.category = "Utility";

module.exports.execute = async (message, args) => {
    // Handling arguments
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    let user = await User.findOne({ id: author.id }).exec();
    
    // Checking if mentioned user doesn't have a profile
    if (!user) {
        user = new User({ id: author.id });
        await user.save();
    }

    // Checking if mentioned user is a bot
    if (author.bot) {
        message.channel.send(negative(author)
            .addField(":name_badge: Unable to show inventory", "Bots doesn't have a profile")
        );
        return;
    }

    // Building a message
    const embed = positive(author).setThumbnail(author.displayAvatarURL());

    // Keeping track of all potions and fragments
    const pots = [];
    const frags = [];

    // Looping through potions
    for (const id of user.potions.keys()) {
        const pot = await Potion.findOne({ _id: id });
        pots.push(`${pot.name} x${user.potions.get(id)}`);
    }

    // Looping through fragments
    for (const id of user.fragments.keys()) {
        const frag = await Fragment.findOne({ _id: id });
        frags.push(`${frag.name} x${user.fragments.get(id)}`);
    }

    // Adding the fields
    if (user.magicule > 0) embed.addField(":gem: Magicules", `${user.magicule} magicules`);
    embed.addField(":champagne_glass: Potions", pots.length > 0 ? pots.sort().join('\n') : "Empty");
    embed.addField(":game_die: Fragments", frags.length > 0 ? frags.sort().join('\n') : "Empty");

    // Sending the message  
    message.channel.send(embed);
    return 1;
};