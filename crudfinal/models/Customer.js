const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Log = require("./ChangeLog");

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
  product: {
    type: String,
    default: "Chưa có sản phẩm",
  },

  bill: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Bill",
  },
  inCharge: {
    type: String,
    required: true,
  },
  saleName: {
    type: String,
  },
});
module.exports = mongoose.model("Customer", CustomerSchema);
