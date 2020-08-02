const { prefix } = require("../config.json");
const { positive, negative } = require("../functions/embed");
const User = require("../models/User");
const Pet = require("../models/Pet");
const curve = require("../functions/curve");
const handle = require("../functions/handle");
const get = require("../functions/get");
const add = require("../functions/add");

module.exports.cooldown = 60;
module.exports.description = "Duel with other users in a pet vs pet battle.";
module.exports.usage = `${prefix}duel (@user)`;
module.exports.aliases = [];
module.exports.category = "Pet";

module.exports.execute = async message => {
    // Validating pet
    const attacker = await User.findOne({ id: message.author.id });
    if (!attacker.pet) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to duel", "You don't even have a pet to begin with.")
        );
        return;
    }

    // Validating if a user is mentioned
    const mention = message.mentions.users.first();
    if (!mention) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to duel", "Please mention a valid user.")
        );
        return;
    }

    // Verifying if it isn't a self mention
    if (mention.id == message.author.id) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to duel", "You can't duel with yourself.")
        );
        return;
    }
    
   // Checking if mentioned user is a bkt
   if (mention.bot) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to duel", "Bots doesn't have a profile.")
        );
        return;
    }

    // Checking if mentioned user doesn't have a profile
    let defender = await User.findOne({ id: mention.id });
    if (!defender) {
        defender = new User({ id: mention.id });
        await defender.save();
    }

    // Checking if defender doesn't have pet
    if (!defender.pet) {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Unable to duel", `${mention.username} doesn't have a pet.`)
        );
        return;
    }

    // Checking mana
    const mana = Math.floor(attacker.mana.limit * 15 / 100);
    if (attacker.mana.current < mana) {
        message.channel.send(negative(message.author)
            .addFields(
                { name: ":name_badge: Unable to duel", value: `**Required**: ${mana} mana\n**Current**: ${user.mana.current}/${user.mana.limit}`},
                { name: ":drop_of_blood: Replenish mana", value: "Meditate or drink potions."}
            )
        );
        return;
    }

    // Getting their pets
    const attackerPet = await Pet.findOne({ _id: attacker.pet });
    const defenderPet = await Pet.findOne({ _id: defender.pet });

    // Sending first message
    const embed = positive(message.author)
        .addFields(
            { name: `:crossed_swords: ${message.author.username}'s Pet`, value: `**Level**: ${attacker.level}\n**Pet**: ${attackerPet.name}\n**Rarity**: ${attackerPet.rarity}\n**Type**: ${attackerPet.type}` },
            { name: `:shield: ${mention.username}'s Pet`, value: `**Level**: ${defender.level}\n**Pet**: ${defenderPet.name}\n**Rarity**: ${defenderPet.rarity}\n**Type**: ${defenderPet.type}` },
            { name: `:bulb: Accept Duel`, value: `${mention.username} has 10 seconds to accept the duel request.\nSay **yes** or **accept**.` }
        );
    message.channel.send(embed);

    // Waiting for next message 
    const next = await message.channel.awaitMessages(msg => {
        return msg.author.id == mention.id && (msg.content.toLowerCase() == "yes" || msg.content.toLowerCase() == "accept")
    }, { time: 10000 });

    // If accepted
    if (next.size != 0) {
        // Calculating power based on level and buffs %
        let attackPower = attacker.level * 2;
        let defensePower = defender.level * 2;
        for (const perc of attacker.buffs.values()) attackPower += perc;
        for (const perc of defender.buffs.values()) defensePower += perc;

        // Calculating power based on element and rarity
        const diff = Math.abs(attackerPet.abilities - defenderPet.abilities) + 1;
        const attackAdv = (attackerPet.type == "Water" && defenderPet.type == "Fire")
            || (attackerPet.type == "Fire" && defenderPet.type == "Thunder")
            || (attackerPet.type == "Thunder" && defenderPet.type == "Dark")
            || (attackerPet.type == "Dark" && defenderPet.type == "Earth")
            || (attackerPet.type == "Earth" && defenderPet.type == "Water");
        const defenseAdv = (defenderPet.type == "Water" && attackerPet.type == "Fire")
            || (defenderPet.type == "Fire" && attackerPet.type == "Thunder")
            || (defenderPet.type == "Thunder" && attackerPet.type == "Dark")
            || (defenderPet.type == "Dark" && attackerPet.type == "Earth")
            || (defenderPet.type == "Earth" && attackerPet.type == "Water")
        if (attackAdv) attackPower += 10 * diff;
        if (defenseAdv) defensePower += 10 * diff;

        // Getting winner
        const winner = { account: null, profile: null };
        if (attackPower >= defensePower) {
            winner.account = message.author;
            winner.profile = attacker;
        } else {
            winner.account = mention;
            winner.profile = defender;
        }
        const adv = attackAdv ? `\n**Attack Advantage**: ${attackerPet.type} > ${defenderPet.type}` : defenseAdv ? `\n**Defense Advantage**: ${defenderPet.type} > ${attackerPet.type}` : "";
        
        // Building message
        const embed = positive(winner.account)
            .addFields(
                { name: ":skull_crossbones: Duel finished", value: `**Winner**: ${winner.account.username}${adv}` },
                { name: ":boom: Combat Power", value: `**Attacker**: ${attackPower}\n**Defender**: ${defensePower}` }
            );
        
        // Calculating experience
        const perc = 3 * curve(winner.profile.level);
        const exp = Math.floor(winner.profile.experience.limit * perc / 100);
        handle(winner.profile, exp, mana, embed);
        
        // Giving frag
        const frag = await get.frag();
        add(1, frag._id, winner.profile.fragments);
        embed.addField(":game_die: Fragment Found", frag.name);

        // Updating user and sending message
        await User.updateOne({ id: winner.account.id }, { $set: winner.profile });
        message.channel.send(embed);
        return 1;
    } 
    
    // If rejected
    else {
        message.channel.send(negative(message.author)
            .addField(":name_badge: Duel rejected", `${mention.username} didn't accept duel request in time.`)
        );
        return;
    }

}
