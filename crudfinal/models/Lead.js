const mongoose = require("mongoose");

const LeadSchema = new mongoose.Schema({
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
  rep: {
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
      "Success",
    ],
    default: "No contact",
  },
  inCharge: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Lead", LeadSchema);
