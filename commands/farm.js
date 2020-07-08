const Discord = require("discord.js");
const User = require("../models/User");
const { color } = require("../config.json");

module.exports = {
    execute(message) {
        User.findOne({ id: message.author.id }).exec().then(user => {
            const n = Math.ceil(Math.random() * 4);
            const m = Math.floor(10 + user.level * 1.1);
        
            // Check for minimum mana
            if (user.mana[0] < m * 4) {
                message.channel.send(new Discord.MessageEmbed()
                    .setColor("#ff0000")
                    .setTitle("Unable to farm!")
                    .setDescription(`You need atleast **${m * 4} mana** to go farming!`)
                    .setFooter("You can ~meditate or ~drink <potion> to replenish your mana!")
                );
                return;
            }
        
            const e = 40 * user.level;
            const changes = {experience: user.experience, mana: user.mana, level: user.level};
            changes.mana[0] = user.mana[0] - m * n;

            // Check for level up
            let lvlup = false;
            const total = user.experience[1] + e * n;
            const limit = user.experience[0] + 100 * user.level;
            if (total >= limit) {
                lvlup = true;
                changes.experience[0] = limit + 100 * user.level;
                changes.experience[1] = total - limit;
                changes.level = user.level + 1;
                changes.mana[1] = 90 + (user.level + 1) * 10;
                changes.mana[0] = changes.mana[1];
            } else {
                changes.experience[1] = total;
            }

            User.updateOne({ id: message.author.id }, { $set: changes }).exec().then(res => {
                let msg;
                if (lvlup) {
                    msg = new Discord.MessageEmbed()
                        .setTitle("Level Up!")
                        .setColor(color)
                        .addFields(
                            { name: ":ghost: Monsters killed", value: `${n} monster(s) found while farming` },
                            { name: ":fire: Total experience gained", value: `${e * n} experience points (${e} per monster)` }, 
                            { name: ":sweat_drops: Total mana taken", value: `${m * n} mana points (${m} per monster)` },
                            { name: ":up: Level increased", value: `${changes.level - 1} -> ${changes.level}` },
                            { name: ":up: Maximum mana increased", value: `${90 + (changes.level - 1) * 10} -> ${changes.mana[1]}` }
                        );
                } else {
                    msg = new Discord.MessageEmbed()
                        .setTitle("Farming done!")
                        .setColor(color)
                        .addFields(
                            { name: ":ghost: Monsters killed", value: `${n} monster(s) found while farming` },
                            { name: ":fire: Total experience gained", value: `${e * n} experience points (${e} per monster)` }, 
                            { name: ":sweat_drops: Total mana taken", value: `${m * n} mana points (${m} per monster)` },
                        );
                }
                message.channel.send(msg);
            }).catch(console.log);
        }).catch(console.log);
    }
};
