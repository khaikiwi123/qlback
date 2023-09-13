const mongoose = require("mongoose");

const LogSchema = new mongoose.Schema({
  documentId: mongoose.Schema.Types.ObjectId,
  sourceCollection: String,
  field: String,
  oldValue: mongoose.Schema.Types.Mixed,
  newValue: mongoose.Schema.Types.Mixed,
  changedBy: {
    type: String,
    required: true,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
  product: {
    type: String,
  },
  daysLastUp: {
    type: Number,
  },
});

module.exports = mongoose.model("Log", LogSchema);
