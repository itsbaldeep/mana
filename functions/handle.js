module.exports = (user, exp, mana, embed) => {

    // Variables for buffs
    const grace = user.buffs.has("Nature's Grace");
    const reversion = user.buffs.has("Mana Reversion");
    const dew = user.buffs.has("Morning Dew");
    const lucky = user.buffs.has("Lucky Break");

    // Checking Nature's Grace
    let reduction = 0;
    if (grace) {
        reduction = Math.floor(mana * user.buffs.get("Nature's Grace") / 100);
    }

    // Checking Mana Reversion
    let revert = false;
    if (reversion) {
        revert = Math.random() < user.buffs.get("Mana Reversion") / 100;
        if (revert) { mana = 0; reduction = 0; }
    }

    // Taking mana
    user.mana.current -= mana - reduction;

    // Checking for Morning Dew
    let recover = false;
    if (dew) {
        recover = Math.random() < user.buffs.get("Morning Dew") / 100;
        if (recover) user.mana.current = user.mana.limit;
    }

    // Checking for lucky break buff
    let bonus = 0;
    if (lucky) {
        bonus = Math.floor(exp * user.buffs.get("Lucky Break") / 100);
    }

    // Giving experience
    const total = user.experience.current + exp + bonus;

    // If user levelled up
    const lvlup = total >= user.experience.limit
    if (lvlup) {
        // Handling experience
        user.experience.current = total - user.experience.limit;
        user.experience.limit = user.experience.limit + 128 * user.level;

        // Handling mana
        user.mana.limit += 16 * user.level;
        user.mana.current = user.mana.limit;

        // Handling level
        user.level += 1;
        embed.addField(":crossed_swords: Level increased", `**Combat level**: ${user.level - 1} -> ${user.level}`);
    }

    // If user didn't level up
    else user.experience.current = total;

    // Experience Info
    embed.addField(
        ":fire: Experience",
        `**Gained**: ${exp} ${lucky ? `(+${bonus}) ` : ""}points\n**Current**: ${user.experience.current}/${user.experience.limit}`
    );

    // Mana Info
    embed.addField(
        ":tropical_drink: Mana",
        `**Consumed**: ${revert ? "Reverted" : `${mana} ${grace ? `(-${reduction}) ` : ""}points`}\n**Current**: ${user.mana.current}/${user.mana.limit}${recover ? " (Dew)" : ""}`
    );

}

