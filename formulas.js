module.exports.calculateMana = level => 70 + 28 * level + 10 * (level - 1);
module.exports.calculateExp = (limit, level) => limit + 103 * level;
module.exports.calculateMobMana = level => Math.floor(7 + 1.1 * level);
module.exports.calculateMobExp = level => Math.floor(33 * level);
module.exports.replenishMana = level => Math.floor(Math.random() * level * 6 + 50) + level;
module.exports.exploreExp = level => Math.floor(Math.random() * level * 68) + Math.floor(56 * level);