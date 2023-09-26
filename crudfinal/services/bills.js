const Bill = require("../models/Bill");
const {
  getDocuments,
  getOne,
  createOne,
  deleteOne,
  updateOne,
} = require("../modules/generator");

module.exports = {
  getBill: async (event) => {
    try {
      const { documents, total } = await getDocuments(Bill, event, [
        "customer",
        "org",
        "product",
        "length",
        "price",
        "status",
        "inCharge",
        "saleName",
      ]);
      return { bills: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getOneBill: async (event) => {
    return await getOne(event, Bill, "Bill");
  },
  createBill: async (event) => {
    const inputs = [
      "customer",
      "org",
      "product",
      "length",
      "price",
      "startDate",
      "inCharge",
      "saleName",
    ];
    return await createOne(event, inputs, Bill);
  },
  updateBill: async (event) => {
    const inputs = [
      "customer",
      "org",
      "product",
      "length",
      "price",
      "startDate",
      "inCharge",
      "saleName",
    ];
    return await updateOne(event, inputs, Bill);
  },
  deleteBill: async (event) => {
    return await deleteOne(event, Bill);
  },
};
