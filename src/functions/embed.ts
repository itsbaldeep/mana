import { color } from "@config/app";
import {
  APIEmbedField,
  ColorResolvable,
  EmbedBuilder,
  Message,
} from "discord.js";

const embed = (
  color: ColorResolvable,
  message: Message<boolean>,
  field: Array<APIEmbedField> | APIEmbedField
) => {
  message.channel.send({
    embeds: [
      new EmbedBuilder()
        .setColor(color)
        .setAuthor({
          name: message.author.username + "#" + message.author.discriminator,
          iconURL: message.author.displayAvatarURL(),
        })
        .setTimestamp()
        .addFields(Array.isArray(field) ? field : [field]),
    ],
  });
};

export const negative = (
  message: Message<boolean>,
  field: Array<APIEmbedField> | APIEmbedField
) => embed(color.error, message, field);
export const positive = (
  message: Message<boolean>,
  field: Array<APIEmbedField> | APIEmbedField
) => embed(color.error, message, field);
