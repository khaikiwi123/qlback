const mongoose = require("mongoose");
const Bill = require("./Bill");
const Lead = require("./Lead");
const Customer = require("./Customer");

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    unique: true,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ["user", "admin"],
    default: "user",
  },
  phone: {
    type: String,
    require: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  status: {
    type: Boolean,
    default: true,
  },
  token: {
    type: String,
    default: "",
  },
});
userSchema.pre("findOneAndUpdate", async function (next) {
  try {
    const name = this.name;
    const newName = this.getUpdate().name;
    const LeadModel = mongoose.model("Lead");
    const CustomerModel = mongoose.model("Customer");
    const BillModel = mongoose.model("Bill");
    await LeadModel.findOneAndUpdate({ saleName: name }, { saleName: newName });
    await CustomerModel.findOneAndUpdate(
      { saleName: name },
      { saleName: newName }
    );
    await BillModel.findOneAndUpdate({ saleName: name }, { saleName: newName });
  } catch (error) {
    next(error);
  }
});

module.exports = mongoose.model("User", userSchema);
