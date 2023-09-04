const mongoose = require("mongoose");

const CustomerSchema = new mongoose.Schema({
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
  inCharge: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Customer", CustomerSchema);
