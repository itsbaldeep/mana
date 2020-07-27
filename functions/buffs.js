const Buff = require("../models/Buff");

module.exports = async (buffs, abilities, embed) => {
    // Removing current buffs from user
    buffs.clear();

    // Keeping track of buffs
    const list = [];
    const active = [];
    
    // Function to get a unique buff
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
        buffs.set(pick._id.toString(), proc);

        list.push({ name: pick.name, proc });
    }
    // Showing the buff in message
    embed.addField(":white_sun_cloud: New buffs", list.map(buff => `${buff.name} -> ${buff.proc}%`).join("\n"))
}