const Buff = require("../models/Buff");

module.exports = async (buffs, abilities, embed) => {
    // Removing current buffs from user
    buffs.clear();

    // Function to get a unique buff
    const active = [];
    const count = await Buff.countDocuments();
    const all = await Buff.find();
    function unique() {
        const random = Math.floor(Math.random() * count);
        if (active.includes(random)) return unique();
        active.push(random);
        return random;
    }
    
    // Looping equal to amount of abilities
    for (let i = 0; i < abilities; i++) {
        // Picking a random buff from the list
        const random = unique();
        const pick = all[random];
    
        // Getting a random proc rate and updating user record
        const proc = Math.floor(Math.random() * (pick.range.max - pick.range.min + 1)) + pick.range.min;
        buffs.set(pick.name, proc);
    }
    
    // Showing the buff in message
    const text = [];
    for (const entry of buffs.entries())
        text.push(`${entry[0]} -> ${entry[1]}`);
    embed.addField(":white_sun_cloud: New buffs", text.join("\n"));
}