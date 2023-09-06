const service = require("../services/products");

module.exports = {
  functions: async (event, context, callback) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/products/{id}") {
          return await service.getOneProduct(event);
        } else {
          return await service.getProd(event);
        }
      case "POST":
        return await service.createProd(event);
      case "PUT":
        return await service.updateProd(event);
      case "DELETE":
        return await service.deleteProd(event);
      default:
        return {
          statusCode: 500,
          body: "wrong method",
        };
    }
  },
};
