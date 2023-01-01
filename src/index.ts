import { prefix } from "@config/app";
import { intents } from "@config/intents";
import { negative } from "@functions/embed";
import { User } from "@models/User";
import { ActivityType, Client, Collection, Events } from "discord.js";
import { readdir } from "fs/promises";
import { connect } from "mongoose";
import { join } from "path";

async function main() {
  const bot = new Client({ intents });

  bot.commands = new Collection();
  bot.aliases = new Collection();
  bot.cooldowns = new Collection();
  bot.categories = new Collection();

  try {
    const files = await readdir(join(__dirname, "commands"));
    const commands = files.filter((file) => file.endsWith(".js"));

    for (const file of commands) {
      const command: Command = await import(`@commands/${file}`).command;
      const name = file.slice(0, file.indexOf(".js"));

      bot.commands.set(name, command);
      command.aliases.forEach((alias) => bot.aliases.set(alias, name));
      bot.cooldowns.set(name, new Map());

      if (!command.category) return;
      if (bot.categories.has(command.category)) {
        const cat = `${bot.categories.get(command.category)}, ${name}`;
        bot.categories.set(command.category, cat);
      } else {
        bot.categories.set(command.category, name);
      }
    }
  } catch (error) {
    console.log("[FS]", (error as Error).message);
  }

  bot.once(Events.ClientReady, () => {
    console.log("[Bot] Ready");
    bot.user?.setActivity({
      type: ActivityType.Playing,
      name: "with your VOID",
    });
  });

  bot.once(Events.MessageCreate, async (message) => {
    if (!message.content.startsWith(prefix) || message.author.bot) return;
    console.log("[MessageCreate]", message.content);

    const args = message.content.slice(prefix.length).split(/ +/);
    let cmd = args.shift()?.toLowerCase() as string;

    const id = message.author.id;

    try {
      const user = await User.findOne({ id });
      if (!user) await new User({ id }).save();

      let command: Command;
      if (bot.commands.has(cmd)) {
        command = bot.commands.get(cmd);
      } else if (cmd && bot.aliases.has(cmd)) {
        command = bot.commands.get(bot.aliases.get(cmd));
        cmd = bot.aliases.get(cmd) as string;
      } else return;

      const cd = command.cooldown;
      if (bot.cooldowns.get(cmd)?.has(id)) {
        const init = bot.cooldowns.get(cmd)?.get(id) as number;
        const curr = Date.now();
        const diff = Math.ceil((curr - +init) / 1000);
        negative(message, {
          name: `:clock: Cooldown on ${cmd[0].toUpperCase() + cmd.slice(1)}`,
          value: `**Remaining**: ${
            cd - diff + 1
          } seconds\n**Total**: ${cd} seconds`,
        });
        return;
      } else {
        bot.cooldowns.get(cmd)?.set(id, Date.now());
        setTimeout(() => bot.cooldowns.get(cmd)?.delete(id), cd * 1000);
      }

      const code = await command.execute(message, args, bot);
      if (!code && bot.cooldowns.get(cmd)?.has(id))
        bot.cooldowns.get(cmd)?.delete(id);
    } catch (error) {
      console.log("[MessageCreate]", (error as Error).message);
      negative(message, {
        name: ":name_badge: Error",
        value: `There has been a technical error while running ${
          cmd[0].toUpperCase() + cmd.slice(1)
        } command, please contact **Cult#1317** asap!`,
      });
    }
  });

  try {
    await connect(process.env.DATABASE_URL as string);
    console.log("[Database] Connected successfully");
  } catch (error) {
    console.log("[Database]", (error as Error).message);
  }

  try {
    await bot.login(process.env.SECRET_TOKEN);
    console.log("[Bot] Connected successfully");
  } catch (error) {
    console.log("[Bot]", (error as Error).message);
  }
}

main();
