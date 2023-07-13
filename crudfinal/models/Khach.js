const mongoose = require("mongoose");

const KhachSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  phone: {
    type: String,
    required: true,
  },
  address: {
    type: String,
    required: true,
  },

  status: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model("Khach", KhachSchema);
