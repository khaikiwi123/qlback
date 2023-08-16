const Lead = require("../models/Lead");
const Client = require("../models/Client");
const {
  getDocuments,
  getOne,
  updateOne,
  createOne,
  deleteOne,
} = require("../modules/generator");

module.exports = {
  getLead: async (event) => {
    try {
      const { documents, total } = await getDocuments(
        Lead,
        event,
        ["status", "rep", "org", "email", "phone", "inCharge"],
        { createdDate: -1 }
      );
      return { leads: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOneLead: async (event) => {
    return await getOne(event, Lead, "Lead");
  },

  createLead: async (event) => {
    const inputs = ["phone", "email", "org", "rep", "inCharge"];
    return await createOne(event, inputs, Lead);
  },

  updateLead: async (event, userEmail) => {
    const inputs = ["phone", "email", "org", "rep", "status", "inCharge"];
    return await updateOne(event, inputs, Lead, Client, userEmail);
  },
  deleteLead: async (event) => {
    return await deleteOne(event, Lead);
  },
};
