import { model, Schema } from "mongoose";

export const Pet = model(
  "Pet",
  new Schema({
    _id: Schema.Types.ObjectId,
    name: String,
    abilities: Number,
    rarity: String,
    type: String,
    fragment: {
      type: Schema.Types.ObjectId,
      ref: "Fragment",
    },
  })
);
