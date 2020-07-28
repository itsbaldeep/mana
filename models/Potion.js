const mongoose = require("mongoose");

module.exports = mongoose.model("Potion", mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    power: Number,
    chance: Number,
    worth: Number
}));
