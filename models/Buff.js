const mongoose = require("mongoose");

module.exports = mongoose.model("Buff", mongoose.Schema({
    _id: mongoose.Schema.Types.ObjectId,
    name: String,
    range: {
        min: Number,
        max: Number
    }
}));
