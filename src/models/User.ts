import { model, Schema } from "mongoose";

export const User = model(
  "User",
  new Schema({
    id: Number,
    level: {
      type: Number,
      default: 1,
    },
    trials: {
      type: Number,
      default: 1,
    },
    pet: {
      type: Schema.Types.ObjectId,
      default: null,
      ref: "Pet",
    },
    magicule: {
      type: Number,
      default: 0,
    },
    experience: {
      current: {
        type: Number,
        default: 0,
      },
      limit: {
        type: Number,
        default: 128,
      },
    },
    mana: {
      current: {
        type: Number,
        default: 64,
      },
      limit: {
        type: Number,
        default: 64,
      },
    },
    potions: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    fragments: {
      type: Map,
      of: Number,
      default: new Map(),
    },
    buffs: {
      type: Map,
      of: Number,
      default: new Map(),
    },
  })
);
