const User = require("../models/User");
const Potion = require("../models/Potion");
const Item = require("../models/Item");
const { prefix } = require("../config.json");
const { negativeEmbed, positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.description = "You can have a look at your whole inventory by using this command, that includes all your items and potions.";
module.exports.usage = `${prefix}inventory (@mention)`;
module.exports.aliases = ["inv"];

module.exports.execute = async message => {
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    const user = await User.findOne({ id: author.id }).exec();

    // Validating if mentioned user exists
    if (!user) {
        message.channel.send(negativeEmbed(author)
            .addField(":name_badge: Unable to show inventory!", "The person has no profile and he/she needs to run a command first!")
        );
        return;
    }

    const embed = positiveEmbed(author).setThumbnail(author.displayAvatarURL())

    // Potions
    const pots = [];
    if (user.potions.length > 0) {
        const reqs = [];
        user.potions.forEach(potion => {
            const req = Potion.findOne({ _id: potion[0] });
            reqs.push(req);
        });
        const inv = await Promise.all(reqs);
        inv.forEach((pot, i) => {
            const quantity = user.potions[i][1];
            if (quantity > 0) {
                pots.push(`${pot.name} x${quantity}`);
            }
        });
    }

    // Items
    const items = [];
    if (user.items.length > 0) {
        const reqs = [];
        user.items.forEach(item => {
            const req = Item.findOne({ _id: item[0] });
            reqs.push(req);
        });
        const inv = await Promise.all(reqs);
        inv.forEach((item, i) => {
            const quantity = user.items[i][1];
            if (quantity > 0) {
                items.push(`${item.name} x${quantity}`);
            }
        });
    }

    embed.addField(":toolbox: Potions", pots.length > 0 ? pots.sort().join('\n') : "Empty");
    embed.addField(":briefcase: Items", items.length > 0 ? items.sort().join('\n') : "Empty");

    message.channel.send(embed);
    return 1;
}
