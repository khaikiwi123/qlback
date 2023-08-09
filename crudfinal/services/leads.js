const Lead = require("../models/Lead");
const validator = require("validator");
const User = require("../models/User");
const Client = require("../models/Client");
const { getDocuments, getOne } = require("../modules/generator");

module.exports = {
  getLead: async (event) => {
    try {
      const { documents, total } = await getDocuments(Lead, event, [
        "status",
        "rep",
        "org",
        "email",
        "phone",
        "inCharge",
      ]);
      return { leads: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOneLead: async (event) => {
    return await getOne(event, Lead, "Lead");
  },

  createLead: async (event) => {
    const { phone, email, org, rep, status, inCharge } = JSON.parse(event.body);

    const fields = [phone, email, org, rep, inCharge];
    if (fields.some((field) => !field || !field.trim())) {
      throw new Error("Please fill out all the form");
    }

    const findOneNumber = await Lead.findOne({ phone: phone.trim() });
    const findOneEmail = await Lead.findOne({
      email: email.trim().toLowerCase(),
    });
    const findOneInCharge = await User.findOne({
      email: inCharge.trim().toLowerCase(),
    });

    if (findOneEmail) {
      const error = new Error("Lead's email is already in the system");
      error.id = findOneEmail._id;
      error.inCharge = findOneEmail.inCharge;
      throw error;
    }
    if (findOneNumber) {
      const error = new Error("Lead's number is already in the system");
      error.id = findOneNumber._id;
      error.inCharge = findOneNumber.inCharge;
      throw error;
    }
    if (!findOneInCharge) {
      throw new Error("Sale user doesn't exist");
    }

    if (!validator.isEmail(email.trim().toLowerCase())) {
      throw new Error("Email isn't valid");
    }

    try {
      const newLead = new Lead({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        org: org.trim(),
        rep: rep.trim(),
        inCharge: inCharge.trim().toLowerCase(),
        status,
      });

      await newLead.save();

      return "Lead created";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateLead: async (event) => {
    const id = event.pathParameters.id;
    const { phone, email, org, rep, status, inCharge } = JSON.parse(event.body);
    let update = {};

    if (email && email.trim().toLowerCase()) {
      if (!validator.isEmail(email.trim().toLowerCase())) {
        throw new Error("Email isn't valid");
      }
      const findOneEmail = await Lead.findOne({
        email: email.trim().toLowerCase(),
      });
      if (findOneEmail) {
        const error = new Error(
          "Email already in use, please choose a different one."
        );
        error.id = findOneEmail._id;
        error.inCharge = findOneEmail.inCharge;
        throw error;
      }

      update.email = email.trim().toLowerCase();
    }
    if (phone && phone.trim()) {
      const findOneNumber = await Lead.findOne({
        phone: phone.trim(),
      });
      if (findOneNumber) {
        const error = new Error(
          "Phone number already in use, please choose a different one."
        );
        error.id = findOneNumber._id;
        error.inCharge = findOneNumber.inCharge;
        throw error;
      }

      update.phone = phone.trim();
    }
    if (org && org.trim()) update.org = org.trim();
    if (rep && rep.trim()) update.rep = rep.trim();
    if (inCharge && inCharge.trim()) update.inCharge = inCharge.trim();
    if (status) update.status = status;

    try {
      let leadData = await Lead.findById(id);

      if (!leadData) {
        throw new Error("Lead not found");
      }

      if (status === "Success") {
        const clientData = leadData.toObject();
        clientData.status = "Success";

        const client = new Client(clientData);
        await client.save();

        await Lead.findByIdAndDelete(id);
        return "Lead moved to Client";
      } else {
        await Lead.findByIdAndUpdate(id, { status }, { new: true });
        return "Customer updated";
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteLead: async (event) => {
    const id = event.pathParameters.id;

    try {
      await Lead.findByIdAndDelete(id);
      return "Customer deleted";
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
