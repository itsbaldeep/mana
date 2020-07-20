module.exports = () => {
    const items = [
        { name: "Earthling Arm", rarity: 16},
        { name: "Earthling Leg", rarity: 16},
        { name: "Earthling Chest", rarity: 8},
        { name: "Earthling Skull", rarity: 8},
        { name: "Waterling Arm", rarity: 8},
        { name: "Waterling Leg", rarity: 8},
        { name: "Waterling Chest", rarity: 4},
        { name: "Waterling Skull", rarity: 4},
        { name: "Fireling Arm", rarity: 4},
        { name: "Fireling Leg", rarity: 4},
        { name: "Fireling Chest", rarity: 2},
        { name: "Fireling Skull", rarity: 2},
        { name: "Scroll of Mages", rarity: 7},
        { name: "Golem Arm", rarity: 1},
        { name: "Golem Leg", rarity: 1},
        { name: "Golem Chest", rarity: 0.5},
        { name: "Golem Skull", rarity: 0.5},
        { name: "Lich Arm", rarity: 1},
        { name: "Lich Leg", rarity: 1},
        { name: "Lich Chest", rarity: 0.5},
        { name: "Lich Skull", rarity: 0.5},
        { name: "Phoenix Arm", rarity: 1},
        { name: "Phoenix Leg", rarity: 1},
        { name: "Phoenix Chest", rarity: 0.5},
        { name: "Phoenix Skull", rarity: 0.5}
    ];

    // Weighted distribution according to rarity
    let array = [];
    for (const item of items) {
        for (let i = 0; i < item.rarity * 2; i++) array.push(item.name);
    }
    
    // Picking random element and mapping its rarity to its corresponding name
    const picked = array[Math.floor(Math.random() * array.length)];
    let rarity;
    if (picked.startsWith("Earthling")) rarity = "Common";
    if (picked.startsWith("Waterling")) rarity = "Uncommon";
    if (picked.startsWith("Fireling")) rarity = "Rare";
    if (picked.startsWith("Lich")) rarity = "Legendary";
    if (picked.startsWith("Golem")) rarity = "Legendary";
    if (picked.startsWith("Phoenix")) rarity = "Legendary";
    if (picked.startsWith("Scroll")) rarity = "Scroll";;
    
    return {picked, rarity};
}