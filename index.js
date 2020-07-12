// Libraries
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("./models/User");

// Configuration files
const { prefix } = require("./config.json");

// Initializing client and commands and cooldowns
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

const cds = new Map();

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	const name = file.slice(0, -3);
	cds.set(name, new Map());
	client.commands.set(name, command);
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
	const command = args.shift().toLowerCase();
	if (!client.commands.has(command)) return;

	const id = message.author.id;

	// Handling cooldowns
	let cd = client.commands.get(command).cooldown;
	if (cds.get(command).has(id)) {
		let init = cds.get(command).get(id);
		let curr = new Date();
		let diff = Math.round((curr-init)/1000);
		message.channel.send(new Discord.MessageEmbed()
            .setColor("#ff0000")
            .setTitle("You are on cooldown!")
			.addFields(
				{ name: `Cooldown on ${command} command`, value: `${cd} seconds` },
				{ name: "Time left", value: `${cd-diff} seconds` }
			)
            .setAuthor(message.author.username + "#" + message.author.discriminator, message.author.displayAvatarURL())
            .setTimestamp()
        );
		return;
	} else {
		cds.get(command).set(id, new Date());
		setTimeout(() => cds.get(command).delete(id), cd * 1000);
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
				items: []
			});
			await newUser.save();
		}
		const code = await client.commands.get(command).execute(message, args);
		if (!code && cds.get(command).has(id)) cds.get(command).delete(id);
	} catch (error) {
		console.error(error);
		message.reply("There was an error trying to execute that command!");
	}
})

// Logging in
client.login(process.env.DISCORD_API);
