const service = require("../services/bills");

module.exports = {
  functions: async (event, context, callback) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/bills/{id}") {
          return await service.getOneBill(event);
        } else {
          return await service.getBill(event);
        }
      case "POST":
        return await service.createBill(event);
      case "PUT":
        return await service.updateBill(event);
      case "DELETE":
        return await service.deleteBill(event);
      default:
        return {
          statusCode: 500,
          body: "wrong method",
        };
    }
  },
};
