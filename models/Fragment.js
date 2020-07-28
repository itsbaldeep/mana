const mongoose = require("mongoose");

module.exports = mongoose.model("Fragment", mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    chance: Number,
    worth: Number
}));