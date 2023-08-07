const mongoose = require("mongoose");

const ClientSchema = new mongoose.Schema({
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  org: {
    type: String,
    required: true,
  },
  represent: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: String,
    enum: [
      "No contact",
      "In contact",
      "Verified needs",
      "Consulted",
      "Acquired",
      "Failed",
    ],
    default: "No contact",
  },
  inCharge: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Client", ClientSchema);
