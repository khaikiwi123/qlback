const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const Lead = require("./Lead");

const BillSchema = new Schema({
  customer: {
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
  inCharge: {
    type: String,
  },
});
BillSchema.pre("save", async function (next) {
  try {
    const customerPhone = this.customer;

    await Lead.findOneAndUpdate({ phone: customerPhone }, { bill: this._id });

    next();
  } catch (error) {
    next(error);
  }
});
module.exports = mongoose.model("Bill", BillSchema);
