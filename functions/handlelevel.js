const { calculateExp, calculateMana } = require("./formulas");

module.exports = (changes, exp, embed) => {

    const total = changes.experience[1] + exp;
    const limit = calculateExp(changes.experience[0], changes.level);

    if (total >= limit) {
        changes.experience[0] = calculateExp(limit, changes.level);
        changes.experience[1] = total - limit;
        changes.level = changes.level + 1;
        changes.mana[1] = calculateMana(changes.level);
        changes.mana[0] = changes.mana[1];
        embed.addField(":crossed_swords: Level increased", `${changes.level - 1} -> ${changes.level}`);
    }
    else changes.experience[1] = total;

    embed.addField(":book: Current experience", changes.experience[1] + "/" + calculateExp(changes.experience[0], changes.level));
    embed.addField(":droplet: Current mana", changes.mana[0] + "/" + changes.mana[1]);

}
