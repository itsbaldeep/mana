// Libraries
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");

// Custom files
const { prefix } = require("./config.json");
const User = require("./models/User");
const { negative } = require("./functions/embed");

// Initializing client
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.categories = new Discord.Collection();

// Reading all commands
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	const name = file.slice(0, -3);

	client.commands.set(name, command);
	command.aliases.forEach(alias => {
		client.aliases.set(alias, name);
	})
	client.cooldowns.set(name, new Map());
	if (client.categories.has(command.category)) {
		client.categories.set(command.category, client.categories.get(command.category) + ", " + name);
	} else client.categories.set(command.category, name);
}

// Connecting to Database
mongoose.connect(`mongodb+srv://mana:${process.env.MONGODB_PW}@mana.fych6.mongodb.net/Mana?retryWrites=true&w=majority`, {
	useUnifiedTopology: true,
	useNewUrlParser: true
});

// Ready function
client.once("ready", () => {
    client.user.setActivity("with your void", "PLAYING");
});

// Message function
client.on("message", async message => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
	const args = message.content.slice(prefix.length).split(/ +/);
	
	// Command name
	let cmd = args.shift().toLowerCase();

	// Handling aliases
	let command;
	if (client.commands.has(cmd)) {
		command = client.commands.get(cmd);
	} else if (client.aliases.has(cmd)) {
		command = client.commands.get(client.aliases.get(cmd));
		cmd = client.aliases.get(cmd);
	} else return;
	
	const id = message.author.id;

	// Handling cooldowns
	let cd = command.cooldown;
	if (client.cooldowns.get(cmd).has(id)) {
		let init = client.cooldowns.get(cmd).get(id);
		let curr = new Date();
		let diff = Math.ceil((curr-init)/1000);
		message.channel.send(negative(message.author)
			.addField(`:clock: Cooldown on ${cmd[0].toUpperCase() + cmd.slice(1)}`, `**Remaining**: ${cd-diff + 1} seconds\n**Total**: ${cd} seconds`)
        );
		return;
	} else {
		client.cooldowns.get(cmd).set(id, new Date());
		setTimeout(() => client.cooldowns.get(cmd).delete(id), cd * 1000);
	}

    try {
		// Checking if user exists, otherwise making a new one
		const user = await User.findOne({ id: id });
		if (!user) await new User({ id: id }).save();

		// Running the command
		const code = await command.execute(message, args, client);
		if (!code && client.cooldowns.get(cmd).has(id)) client.cooldowns.get(cmd).delete(id);
	} catch (error) {
		console.error(error);
		message.channel.send(negative(message.author)
			.addField(":name_badge: Error", `There has been a technical error while running ${cmd[0].toUpperCase() + cmd.slice(1)} command, please contact **Cult#1317** asap!`)
		);
	}
})

// Logging in
client.login(process.env.DISCORD_API);
