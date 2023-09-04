const service = require("../services/customers.js");

module.exports = {
  functions: async (event, context, userEmail, callback) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/customers/{id}") {
          return await service.getOneCustomer(event);
        } else {
          return await service.getCustomer(event);
        }
      case "PUT":
        return await service.updateCustomer(event, userEmail);
      case "DELETE":
        return await service.deleteCustomer(event);
      default:
        return {
          statusCode: 501,
          body: "wrong method",
        };
    }
  },
};
