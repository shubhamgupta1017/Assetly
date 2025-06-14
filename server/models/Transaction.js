const mongoose = require("mongoose");

const historySchema = new mongoose.Schema({
  action: { type: String, required: true },
  actionDescription: { type: String, required: true },
  date: { type: Date, default: Date.now },
});

const TransactionSchema = new mongoose.Schema(
  {
    itemUID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Item',
      required: true,
    },
    ownerId: {
      type: String,
      required: true,
      index: true,
    },
    issuerId: {
      type: String,
      required: true,
      index: true,
    },
    currentStatus: {
      type: String,
      required: true,
      enum: ['Requested', 'Issued', 'Approved', 'Overdue', 'Returned', 'Rejected', 'Assigned to Project'],
    },
    reason: {
      type: String,
      default: '',
    },
    returnDate: {
      type: Date,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    history: [historySchema],
  },
  {
    timestamps: true, // ✅ Correct place for timestamps
  }
);

module.exports = mongoose.model('Transaction', TransactionSchema);
