// models/Item.js
const mongoose = require("mongoose");

const itemSchema = new mongoose.Schema({
  itemName: {
    type: String,
    required: true
  },
  ownerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  totalQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  availableQuantity: {
    type: Number,
    required: true,
    min: 0
  },
  issuedQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  projectQuantity: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  }
});

module.exports = mongoose.model('Item', itemSchema);
