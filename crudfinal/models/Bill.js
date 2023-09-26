const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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
  createdDate: {
    type: Date,
    default: Date.now,
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

  saleName: {
    type: String,
  },
});
BillSchema.pre("save", async function (next) {
  try {
    const phone = this.customer;
    const inCharge = this.inCharge;
    const saleName = this.saleName;

    const LeadModel = mongoose.model("Lead");
    const CustomerModel = mongoose.model("Customer");
    await LeadModel.findOneAndUpdate(
      { phone: phone },
      { bill: this._id, inCharge: inCharge, saleName: saleName }
    );
    await CustomerModel.findOneAndUpdate(
      { phone: phone },
      { bill: this._id, inCharge: inCharge, saleName: saleName }
    );
    next();
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("Bill", BillSchema);
