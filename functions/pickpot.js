const Potion = require("../models/Potion")

module.exports = async () => {
    let pot;
    const choose = Math.random();
    if (choose < 0.66) {
        pot = await Potion.findOne({ name: "Small Mana Potion" });
    } else if (choose < 0.88) {
        pot = await Potion.findOne({ name: "Medium Mana Potion" });
    } else {
        pot = await Potion.findOne({ name: "Large Mana Potion" });
    }
    return pot;
}
