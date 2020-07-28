module.exports = (user, mana, embed) => {

    // Variables for buffs
    const grace = user.buffs.has("Nature's Grace");
    const reversion = user.buffs.has("Mana Reversion");
    const dew = user.buffs.has("Morning Dew");
    
    // Checking Nature's Grace
    let reduction = 0;
    if (grace) {
        reduction = Math.floor(mana * user.buffs.get("Nature's Grace") / 100);
    }

    // Checking Mana Reversion
    if (reversion) {
        const effective = Math.random() < user.buffs.get("Mana Reversion") / 100;
        if (effective) mana = 0;
    }

    // Taking mana
    user.mana.current -= mana - reduction;

    // Checking for Morning Dew
    let recover = false;
    if (dew) {
        recover = Math.random() < user.buffs.get("Morning Dew") / 100;
        if (recover) user.mana.current = user.mana.limit;
    }

    // Giving necessary messages
    embed.addField(":tropical_drink: Mana consumed", `${mana}${grace ? ` (-${reduction})` : ""} points`)
    embed.addField(":ocean: Current mana", `${user.mana.current}/${user.mana.limit}${recover ? " (Fully recovered due to morning dew)" : ""}`);
}