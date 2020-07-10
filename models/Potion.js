const mongoose = require("mongoose");

module.exports = mongoose.model("Potion", mongoose.Schema({
    name: mongoose.Schema.Types.String,
    power: mongoose.Schema.Types.Number
}));
