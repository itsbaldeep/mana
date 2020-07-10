// Libraries
const Discord = require("discord.js");
const fs = require("fs");
const mongoose = require("mongoose");
const User = require("./models/User");

// Configuration files
const { prefix } = require("./config.json");

// Initializing client and commands
const client = new Discord.Client();
client.commands = new Discord.Collection();
const commandFiles = fs.readdirSync("./commands").filter(file => file.endsWith(".js"));

for (const file of commandFiles) {
	const command = require(`./commands/${file}`);
	const name = file.slice(0, -3);
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

    try {
		const user = await User.findOne({ id: message.author.id }).exec();
		// New User
		if (!user) {
			const newUser = new User({
				id: message.author.id,
				level: 1,
				experience: [0, 0],
				mana: [100, 100],
				items: []
			});
			await newUser.save();
		}
		client.commands.get(command).execute(message, args);
	} catch (error) {
		console.error(error);
		message.reply("There was an error trying to execute that command!");
	}
})

// Logging in
client.login(process.env.DISCORD_API);
