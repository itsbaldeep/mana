const mongoose = require("mongoose");

module.exports = mongoose.model("User", mongoose.Schema({
    id: Number,
    level: {
        type: Number,
        default: 1
    },
    trials: {
        type: Number,
        default: 1
    },
    pet: { 
        type: mongoose.Schema.Types.ObjectId,
        default: null,
        ref: "Pet"
    },
    magicule: {
        type: Number,
        default: 0
    },
    experience: {
        current: {
            type: Number,
            default: 0
        },
        limit: {
            type: Number,
            default: 128
        }
    },
    mana: {
        current: {
            type: Number,
            default: 64
        },
        limit: {
            type: Number,
            default: 64
        }
    },
    potions: {
        type: Map,
        of: Number,
        default: new Map()
    },
    fragments: {
        type: Map,
        of: Number,
        default: new Map()
    },
    buffs: {
        type: Map,
        of: {
            active: {
                type: Boolean,
                default: false
            },
            proc: {
                type: Number,
                default: 0
            }
        },
        default: new Map()
    }
}));