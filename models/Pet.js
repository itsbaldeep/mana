const mongoose = require("mongoose");

module.exports = mongoose.model("Pet", mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    abilities: Number,
    rarity: String,
    type: String,
    fragment: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Fragment'
    }
}));
