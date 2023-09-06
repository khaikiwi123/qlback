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
  createdBy: {
    type: String,
    required: true,
  },
});
LeadSchema.pre("findOneAndUpdate", async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  const newStatus = this.getUpdate().status;

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
