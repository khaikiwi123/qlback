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
  unit: {
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
    type: Boolean,
    default: false,
  },
  createdBy: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model("Client", ClientSchema);
