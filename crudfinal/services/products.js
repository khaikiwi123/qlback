const Product = require("../models/Product");
const {
  createOne,
  getDocuments,
  getOne,
  updateOne,
  deleteOne,
} = require("../modules/generator");

module.exports = {
  getProd: async (event) => {
    try {
      const { documents, total } = await getDocuments(Product, event, [
        "name",
        "price",
        "description",
      ]);
      return { products: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getOneProduct: async (event) => {
    return await getOne(event, Product, "Product");
  },
  createProd: async (event) => {
    const inputs = ["name", "price", "description"];
    return await createOne(event, inputs, Product);
  },
  updateProd: async (event) => {
    const inputs = ["name", "price", "description"];
    return await updateOne(event, inputs, Product);
  },
  deleteProd: async (event) => {
    return await deleteOne(event, Product);
  },
};
