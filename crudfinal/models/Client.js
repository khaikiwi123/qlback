const mongoose = require("mongoose");
const Log = require("../models/ChangeLog");

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
    ],
    default: "No contact",
  },
  inCharge: {
    type: String,
    required: true,
  },
});
ClientSchema.pre("findOneAndUpdate", async function (next) {
  const docToUpdate = await this.model.findOne(this.getQuery());
  const newStatus = this.getUpdate().status;

  if (newStatus && docToUpdate.status !== newStatus) {
    await Log.create({
      documentId: docToUpdate._id,
      sourceCollection: "Client",
      field: "status",
      oldValue: docToUpdate.status,
      newValue: newStatus,
      changedBy: this._update.userEmail,
    });
  }
  next();
});

module.exports = mongoose.model("Client", ClientSchema);
