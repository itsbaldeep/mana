const { positive } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.aliases = [];
module.exports.category = "Info";

module.exports.execute = (message, args, client) => {
    const cmd = args.shift();
    // Checking if there are no or default arguments
    if (!cmd || cmd == "help" || !client.commands.has(cmd)) {
        const embed = positive(message.author);
        const emotes = { Pet: ":dog:", Utility: ":gear:", Combat: ":crossed_swords:", Craft: ":cooking:", Info: ":bulb:" };
        
        for (const entry of client.categories.entries()) {
            embed.addField(`${emotes[entry[0]]} ${entry[0]} commands`, entry[1]);
        }

        message.channel.send(embed);
        return 1;
    }
    
    // Getting help for specific command
    const command = client.commands.get(cmd);
    const embed = positive(message.author)
        .addFields(
            { name: ":gear: " + cmd[0].toUpperCase() + cmd.slice(1) + " command", value: command.description },
            { name: ":alarm_clock: Cooldown", value: command.cooldown + " seconds" },
            { name: ":eyeglasses: Usage", value: command.usage }
        )
    if (command.aliases.length > 0) embed.addField(":scissors: Aliases", command.aliases.join(", "))
    message.channel.send(embed);
    return 1;
}
