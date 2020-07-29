const { positive } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.aliases = [];
module.exports.category = "Utility";

module.exports.execute = (message, args, client) => {
    const cmd = args.shift();
    // Checking if there are no or default arguments
    if (!cmd || cmd == "help" || !client.commands.has(cmd)) {
        const cmds = []
        for (const command of client.commands.keys()) {
            if (command != "help") cmds.push(command);
        }
        const msg = positive(message.author);
        const emotes = { Pet: ":dog:", Utility: ":gear:", Combat: ":crossed_swords:", Craft: ":cooking:" };
        
        for (const entry of client.categories.entries()) {
            msg.addField(`${emotes[entry[0]]} ${entry[0]} commands`, entry[1]);
        }
        message.channel.send(msg);
        return 1;
    }
    
    // Getting help for specific command
    try {
        const command = client.commands.get(cmd);
        const msg = positive(message.author)
            .addFields(
                { name: ":gear: " + cmd[0].toUpperCase() + cmd.slice(1) + " command", value: command.description },
                { name: ":alarm_clock: Cooldown", value: command.cooldown + " seconds" },
                { name: ":eyeglasses: Usage", value: command.usage }
            )
        if (command.aliases.length > 0) msg.addField(":scissors: Aliases", command.aliases.join(", "))
        message.channel.send(msg);
        return 1;
    }
    catch (e) {
        console.log(e);
        message.reply("There was an error trying to execute that command!");
    }
}
