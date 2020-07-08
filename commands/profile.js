const User = require("../models/User");
const Discord = require("discord.js");
const { color } = require("../config.json");

module.exports = {
    execute(message) {
        const disc_id = message.author.id;
        User.findOne({ id: disc_id }).exec().then(res => {
            let user;
            if (!res) {
                user = new User({
                    id: disc_id,
                    level: 1,
                    experience: [0, 0],
                    mana: [100, 100],
                    items: []
                });
                user.save().catch(console.log);
            } else user = res;
            const exp = user.experience[0] + 100 * user.level;
            message.channel.send(new Discord.MessageEmbed()
                .setColor(color)
                .setThumbnail(message.author.displayAvatarURL())
                .setTitle(message.author.username + "#" + message.author.discriminator)
                .addFields(
                    { name: ":crossed_swords: Level", value: user.level},
                    { name: ":book: Experience", value: user.experience[1] + ` (${exp} for next level)`},
                    { name: ":droplet: Mana", value: user.mana[0] + "/" + user.mana[1]},
                    { name: ":briefcase: Inventory", value: user.items.length == 0 ? "Empty" : user.items.join(" ")}
                )
            );
        }).catch(console.log);
    }
};