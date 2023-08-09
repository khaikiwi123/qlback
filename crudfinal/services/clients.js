const Client = require("../models/Client");
const Lead = require("../models/Lead");
const validator = require("validator");
const { getDocuments, getOne } = require("../modules/generator");

module.exports = {
  getClient: async (event) => {
    try {
      const { documents, total } = await getDocuments(Client, event, [
        "status",
        "rep",
        "org",
        "email",
        "phone",
        "inCharge",
      ]);
      return { clients: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOneClient: async (event) => {
    return await getOne(event, Client, "Client");
  },

  updateClient: async (event) => {
    const id = event.pathParameters.id;
    const { phone, email, org, rep, status, inCharge } = JSON.parse(event.body);
    let update = {};

    if (email && email.trim().toLowerCase()) {
      if (!validator.isEmail(email.trim().toLowerCase())) {
        throw new Error("Email isn't valid");
      }
      const findOneEmail = await Client.findOne({
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
      const findOneNumber = await Client.findOne({
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
      let clientData = await Client.findById(id);

      if (!clientData) {
        throw new Error("Lead not found");
      }

      if (status === "Failed") {
        const leadData = clientData.toObject();
        leadData.status = "Consulted";

        const lead = new Lead(clientData);
        await lead.save();

        await Client.findByIdAndDelete(id);
        return "Client moved to Lead";
      } else {
        await Client.findByIdAndUpdate(id, { status }, { new: true });
        return "Client updated";
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteClient: async (event) => {
    const id = event.pathParameters.id;

    try {
      await Client.findByIdAndDelete(id);
      return "Customer deleted";
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
