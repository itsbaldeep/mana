import { model, Schema } from "mongoose";

export const Buff = model(
  "Buff",
  new Schema({
    _id: new Schema.Types.ObjectId(),
    name: String,
    range: {
      min: Number,
      max: Number,
    },
  })
);
