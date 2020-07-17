const mongoose = require("mongoose");

module.exports = mongoose.model("Item", mongoose.Schema({
    name: mongoose.Schema.Types.String,
    rarity: mongoose.Schema.Types.Number
}));
