module.exports = (user, exp, embed) => {
    const total = user.experience.current + exp;

    // If user levelled up
    if (total >= user.experience.limit) {
        // Handling experience
        user.experience.current = total - user.experience.limit;
        user.experience.limit = user.experience.limit + 128 * user.level;

        // Handling mana
        user.mana.limit += 16 * user.level;
        user.mana.current = user.mana.limit;

        // Handling level
        user.level += 1;

        embed.addField(":crossed_swords: Level increased", `${user.level - 1} -> ${user.level}`);
    }

    // If user didn't level up
    else user.experience.current = total;

    // Give these info anyways
    embed.addField(":book: Current experience", `${user.experience.current}/${user.experience.limit}`);
    embed.addField(":droplet: Current mana", `${user.mana.current}/${user.mana.limit}`);

}
