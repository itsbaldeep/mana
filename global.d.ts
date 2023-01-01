import "discord.js/typings/index";
import { Collection } from "discord.js/typings/index";
import { Executor } from "src/types/app";

declare module "discord.js" {
  interface Client {
    commands: Collection;
    aliases: Collection<string, string>;
    cooldowns: Collection<string, Map<string, number>>;
    categories: Collection<string, string>;
  }
}

declare global {
  interface Command {
    aliases: string[];
    category: string;
    cooldown: number;
    usage: string;
    description: string;
    execute: Executor;
  }
}
