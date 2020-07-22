// Libraries
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("./models/User");

// Configuration files
const { prefix } = require("./config.json");
const { negativeEmbed } = require("./functions/embed");

// Initializing client and commands and cooldowns and aliases
const client = new Discord.Client();
client.commands = new Discord.Collection();
client.aliases = new Discord.Collection();
client.cooldowns = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	const name = file.slice(0, -3);
	client.cooldowns.set(name, new Map());
	client.commands.set(name, command);
	command.aliases.forEach(alias => {
		client.aliases.set(alias, name);
	})
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
		message.channel.send(negativeEmbed(message.author)
			.addFields(
				{ name: ":clock: Time left on cooldown", value: `${cd-diff + 1} second(s)` },
				{ name: `:name_badge: Total cooldown on ${cmd[0].toUpperCase() + cmd.slice(1)}`, value: `${cd} seconds` }
			)
        );
		return;
	} else {
		client.cooldowns.get(cmd).set(id, new Date());
		setTimeout(() => client.cooldowns.get(cmd).delete(id), cd * 1000);
	}

    try {
		const user = await User.findOne({ id: id }).exec();
		// New User
		if (!user) {
			const newUser = new User({
				id: id,
				level: 1,
				experience: [0, 0],
				mana: [70, 70],
				potions: [],
				pet: null,
				status: [],
				items: []
			});
			await newUser.save();
		}
		const code = await command.execute(message, args, client);
		if (!code && client.cooldowns.get(cmd).has(id)) client.cooldowns.get(cmd).delete(id);
	} catch (error) {
		console.error(error);
		message.reply("There was an error trying to execute that command!");
	}
})

// Logging in
client.login(process.env.DISCORD_API);
