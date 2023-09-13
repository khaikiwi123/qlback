const mongoose = require("mongoose");
const Log = require("./ChangeLog");

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
      "Failed",
    ],
    default: "No contact",
  },
  trackStatus: {
    type: String,
  },
  statusUpdate: {
    type: Date,
    default: Date.now,
  },
  inCharge: {
    type: String,
    required: true,
  },
  product: {
    type: String,
    default: "Chưa có sản phẩm",
  },
  createdBy: {
    type: String,
    required: true,
  },
});

LeadSchema.pre("findOneAndUpdate", async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  const newStatus = this.getUpdate().status;
  const newProd = this.getUpdate().product;

  if (newStatus && docToUpdate.status !== newStatus) {
    const currentDate = new Date();
    const lastUpdateDate = docToUpdate.statusUpdate;
    const differenceInDays = Math.ceil(
      (currentDate - lastUpdateDate) / (1000 * 60 * 60 * 24)
    );
    await Log.create({
      documentId: docToUpdate._id,
      sourceCollection: "Lead",
      field: "status",
      oldValue: docToUpdate.status,
      newValue: newStatus,
      changedBy: this._update.userEmail,
      daysLastUp: differenceInDays,
    });

    this._update.statusUpdate = currentDate;
  }
  if (newProd && docToUpdate.product !== newProd) {
    const currentDate = new Date();
    await Log.create({
      documentId: docToUpdate._id,
      sourceCollection: "Lead",
      field: "product",
      oldValue: docToUpdate.product,
      newValue: newProd,
      changedBy: this._update.userEmail,
      updatedAt: currentDate,
    });
  }
  next();
});
LeadSchema.pre("save", async function (next) {
  const currentDate = this.createdDate;

  await Log.create({
    documentId: this._id,
    sourceCollection: "Lead",
    field: "created",
    changedBy: this.createdBy,
    updatedAt: currentDate,
  });

  next();
});

module.exports = mongoose.model("Lead", LeadSchema);
