import { negative, positive } from "@functions/embed";
import { Pet } from "@models/Pet";
import { User } from "@models/User";
import { Categories, Executor, ExitCode } from "src/types/app";

export const cooldown = 2;
export const description =
  "Shows experience, mana, levels and magicules of the user.";
export const usage = "profile (@user)";
export const aliases = [];
export const category = Categories.UTILITIES;

export const execute: Executor = async (message) => {
  const mention = message.mentions.users.first();
  const author = mention || message.author;
  const user = await User.findOne({ id: author.id }).exec();

  if (!user) {
    throw new Error("User not found");
  }

  // Checking if mentioned user is a bot
  if (author.bot) {
    negative(message, {
      name: ":name_badge: Unable to show profile",
      value: "Bots doesn't have a profile.",
    });
    return ExitCode.FAILURE;
  }

  let pet;
  if (user.pet) {
    pet = await Pet.findOne({ _id: user.pet });
  }

  positive(message, [
    {
      name: ":crossed_swords: Level",
      value: `**Combat level**: ${user.level}\n**Trial level**: ${user.trials}`,
    },
    {
      name: ":book: Experience",
      value: `${user.experience?.current}/${user.experience?.limit}`,
    },
    {
      name: ":droplet: Mana",
      value: `${user.mana?.current}/${user.mana?.limit}`,
    },
    { name: ":gem: Magicules", value: `${user.magicule} magicules` },
    ...((pet && [
      {
        name: `:raccoon: ${pet.rarity} Pet`,
        value: `${pet.name} (${pet.type} Type)`,
      },
    ]) ||
      []),
  ]);
  return ExitCode.SUCCESS;
};
