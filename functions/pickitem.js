module.exports = () => {
    const items = [
        { name: "Earthling Arm", rarity: 8},
        { name: "Earthling Leg", rarity: 8},
        { name: "Earthling Chest", rarity: 8},
        { name: "Earthling Skull", rarity: 8},
        { name: "Waterling Arm", rarity: 7},
        { name: "Waterling Leg", rarity: 7},
        { name: "Waterling Chest", rarity: 7},
        { name: "Waterling Skull", rarity: 7},
        { name: "Fireling Arm", rarity: 6},
        { name: "Fireling Leg", rarity: 6},
        { name: "Fireling Chest", rarity: 6},
        { name: "Fireling Skull", rarity: 6},
        { name: "Scroll of Mages", rarity: 4},
        { name: "Golem Arm", rarity: 1},
        { name: "Golem Leg", rarity: 1},
        { name: "Golem Chest", rarity: 1},
        { name: "Golem Skull", rarity: 1},
        { name: "Lich Arm", rarity: 1},
        { name: "Lich Leg", rarity: 1},
        { name: "Lich Chest", rarity: 1},
        { name: "Lich Skull", rarity: 1},
        { name: "Phoenix Arm", rarity: 1},
        { name: "Phoenix Leg", rarity: 1},
        { name: "Phoenix Chest", rarity: 1},
        { name: "Phoenix Skull", rarity: 1}
    ];

    // Weighted distribution according to rarity
    let array = [];
    for (const item of items) {
        for (let i = 0; i < item.rarity; i++) array.push(item.name);
    }
    
    // Picking random element and mapping its rarity to its corresponding name
    const picked = array[Math.floor(Math.random() * array.length)];
    const r = items.filter(item => item.name == picked).shift().rarity;
    const rarity = r == 1 ? "Legendary" : r == 6 ? "Rare" : r == 7 ? "Uncommon" : r == 8 ? "Common" : "Scroll";
    
    return { picked, rarity };
}
