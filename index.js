// Libraries
const Discord = require("discord.js");
const fs = require('fs');

// Configuration files
const { prefix } = require("./config.json");

// Initializing client and commands
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
    client.commands.set(file.slice(0, -3), command);
}

// Ready function
client.once("ready", () => {
    client.user.setActivity("with your void", "PLAYING");
});

// Message function
client.on("message", message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    const args = message.content.slice(prefix.length).split(/ +/);
	const command = args.shift().toLowerCase();
	if (!client.commands.has(command)) return;

    try {
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply('there was an error trying to execute that command!');
	}
})

// Logging in
client.login(process.env.DISCORD_API);
