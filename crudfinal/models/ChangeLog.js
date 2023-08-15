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
    expires: "7d",
  },
});

module.exports = mongoose.model("Log", LogSchema);
