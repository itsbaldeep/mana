const { positiveEmbed } = require("../functions/embed");

module.exports.cooldown = 2;
module.exports.aliases = [];

module.exports.execute = (message, args, client) => {
    const cmd = args.shift();
    if (!cmd || cmd == "help" || !client.commands.has(cmd)) {
        const cmds = []
        for (const command of client.commands.keys()) {
            if (command != "help") cmds.push(command);
        }
        message.channel.send(positiveEmbed(message.author)
            .addField(":bulb: Which command do you need help with?", cmds.join(", ")));
        return 1;
    }
    
    try {
        const command = client.commands.get(cmd);
        const embed = positiveEmbed(message.author)
            .addFields(
                { name: ":gear: " + cmd[0].toUpperCase() + cmd.slice(1) + " command", value: command.description },
                { name: ":alarm_clock: Cooldown", value: command.cooldown + " seconds" },
                { name: ":eyeglasses: Usage", value: command.usage }
            )
        if (command.aliases.length > 0) embed.addField(":scissors: Aliases", command.aliases.join(", "))
        message.channel.send(embed);
        return 1;
    }
    catch (e) {
        console.log(e);
        message.reply("There was an error trying to execute that command!");
    }
}
