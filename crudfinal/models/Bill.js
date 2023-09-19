const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Lead = require("./Lead");

const BillSchema = new Schema({
  customer: {
    type: String,
  },
  org: {
    type: String,
  },
  product: {
    type: String,
  },
  price: {
    type: String,
  },
  length: {
    type: String,
  },
  startDate: {
    type: Date,
  },
  status: {
    type: String,
    default: "Active",
  },
  inCharge: {
    type: String,
  },
});
BillSchema.pre("save", async function (next) {
  try {
    const email = this.customer;

    await Lead.findOneAndUpdate({ email: email }, { bill: this._id });

    next();
  } catch (error) {
    next(error);
  }
});
module.exports = mongoose.model("Bill", BillSchema);
