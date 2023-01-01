import type { ClientOptions } from "discord.js";
import { GatewayIntentBits } from "discord.js";

export const intents: ClientOptions["intents"] = [GatewayIntentBits.Guilds];
