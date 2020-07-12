const User = require("../models/User");
const Potion = require("../models/Potion");
const Discord = require("discord.js");
const { color } = require("../config.json");

const { calculateExp } = require("../formulas");

module.exports.cooldown = 3;

module.exports.execute = async message => {
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    const user = await User.findOne({ id: author.id }).exec();
    const embed = new Discord.MessageEmbed()
        .setColor(color)
        .setThumbnail(author.displayAvatarURL())
        .setAuthor(author.username + "#" + author.discriminator, author.displayAvatarURL())
        .setTimestamp()
        .addFields(
            { name: ":crossed_swords: Level", value: user.level},
            { name: ":book: Experience", value: user.experience[1] + ` (${calculateExp(user.experience[0], user.level)} for next level)`},
            { name: ":droplet: Mana", value: user.mana[0] + "/" + user.mana[1]},
    );

    // Check for inventory
    let txt = "";
    if (user.items.length > 0) {
        const reqs = [];
        user.items.forEach(item => {
            const req = Potion.findOne({ _id: item[0] });
            reqs.push(req);
        });
        const inv = await Promise.all(reqs);
        inv.forEach((pot, i) => {
            const quantity = user.items[i][1];
            if (quantity > 0) {
                txt += `${pot.name} x${quantity} \n`;
            }
        });
    }
    embed.addField(":briefcase: Inventory", txt ? txt : "Empty");
    message.channel.send(embed);
    return 1;
}
