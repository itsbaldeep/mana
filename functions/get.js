const Fragment = require("../models/Fragment");
const Potion = require("../models/Potion");

function pick(items) {
    // Weighted distribution according to chance
    const array = [];
    for (const item of items) {
        for (let i = 0; i < item.chance * 2; i++) array.push(item);
    }
    
    // Picking random element
    const item = array[Math.floor(Math.random() * array.length)];
    return item;
}

module.exports.frag = async () => {
    const frags = await Fragment.find();
    return await pick(frags);
}

module.exports.pot = async () => {
    const pots = await Potion.find();
    return await pick(pots);
}
