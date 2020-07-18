const mongoose = require("mongoose");

module.exports = mongoose.model("Pet", mongoose.Schema({
    name: mongoose.Schema.Types.String,
    rarity: mongoose.Schema.Types.String
}));
