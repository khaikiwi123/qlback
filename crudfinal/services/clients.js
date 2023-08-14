const Client = require("../models/Client");
const Lead = require("../models/Lead");
const {
  getDocuments,
  getOne,
  updateOne,
  deleteOne,
} = require("../modules/generator");

module.exports = {
  getClient: async (event) => {
    try {
      const { documents, total } = await getDocuments(
        Client,
        event,
        ["status", "rep", "org", "email", "phone", "inCharge"],
        { createdDate: -1 }
      );
      return { clients: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOneClient: async (event) => {
    return await getOne(event, Client, "Client");
  },

  updateClient: async (event) => {
    const inputs = ["phone", "email", "org", "rep", "status", "inCharge"];
    const status = {
      trigger: "",
      movingStatus: "Consulted",
    };
    return await updateOne(event, inputs, Client, status, Lead);
  },

  deleteClient: async (event) => {
    return await deleteOne(event, Client);
  },
};
