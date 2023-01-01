import { Client, Message } from "discord.js";

export enum Categories {
  UTILITIES = "Utilities",
}

export enum ExitCode {
  FAILURE = 0,
  SUCCESS = 1,
}

export type Executor = (
  message: Message<boolean>,
  args: string[],
  bot: Client<boolean>
) => Promise<ExitCode>;
