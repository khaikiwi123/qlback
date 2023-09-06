const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const CustomerSchema = new Schema({
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
  product: Schema.Types.ObjectId,
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
