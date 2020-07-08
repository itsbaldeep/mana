const mongoose = require("mongoose");

module.exports = mongoose.model("User", mongoose.Schema({
    id: mongoose.Schema.Types.Number,
    level: mongoose.Schema.Types.Number,
    experience: mongoose.Schema.Types.Array,
    mana: mongoose.Schema.Types.Array,
    items: mongoose.Schema.Types.Array
}));
