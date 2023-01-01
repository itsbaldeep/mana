import { negative, positive } from "@functions/embed";
import { Pet } from "@models/Pet";
import { User } from "@models/User";
import { Categories, Executor, ExitCode } from "@types/app";

export const command: Command = {
  cooldown: 2,
  description: "Shows experience, mana, levels and magicules of the user",
  usage: "profile (@user)",
  aliases: [],
  category: Categories.UTILITIES,
  async execute(message) {
    const mention = message.mentions.users.first();
    const author = mention || message.author;
    const user = await User.findOne({ id: author.id }).exec();

    if (!user) {
      throw new Error("User not found");
    }

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
  },
};
