const Item = require("../models/Item");

module.exports = async () => {
    const items = await Item.find();

    // Weighted distribution according to rarity
    let array = [];
    for (const item of items) {
        for (let i = 0; i < item.rarity * 2; i++) array.push(item.name);
    }
    
    // Picking random element and mapping its rarity to its corresponding name
    let picked = array[Math.floor(Math.random() * array.length)];
    let rarity;
    if (picked.startsWith("Earthling")) rarity = "Common";
    if (picked.startsWith("Waterling")) rarity = "Uncommon";
    if (picked.startsWith("Fireling")) rarity = "Rare";
    if (picked.startsWith("Lich")) rarity = "Legendary";
    if (picked.startsWith("Golem")) rarity = "Legendary";
    if (picked.startsWith("Phoenix")) rarity = "Legendary";
    if (picked.startsWith("Scroll")) rarity = "Scroll";
    
    const item = items.filter(item => item.name == picked).shift();
    return { item, rarity };
}
