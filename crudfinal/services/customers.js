const Customer = require("../models/Customer");
const Lead = require("../models/Lead");
const {
  getDocuments,
  getOne,
  updateOne,
  deleteOne,
} = require("../modules/generator");

module.exports = {
  getCustomer: async (event) => {
    try {
      const { documents, total } = await getDocuments(
        Customer,
        event,
        [
          "status",
          "rep",
          "org",
          "email",
          "phone",
          "inCharge",
          "product",
          "saleName",
        ],
        { createdDate: -1 }
      );
      return { customers: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOneCustomer: async (event) => {
    return await getOne(event, Customer, "Customer");
  },

  updateCustomer: async (event, userEmail) => {
    const inputs = [
      "phone",
      "email",
      "org",
      "rep",
      "status",
      "product",
      "inCharge",
      "saleName",
    ];
    return await updateOne(event, inputs, Customer, Lead, userEmail);
  },

  deleteCustomer: async (event) => {
    return await deleteOne(event, Customer);
  },
};
