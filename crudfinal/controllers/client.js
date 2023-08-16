const service = require("../services/clients.js");

module.exports = {
  functions: async (event, context, userEmail, callback) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/clients/{id}") {
          return await service.getOneClient(event);
        } else {
          return await service.getClient(event);
        }
      case "PUT":
        return await service.updateClient(event, userEmail);
      case "DELETE":
        return await service.deleteClient(event);
      default:
        return {
          statusCode: 501,
          body: "wrong method",
        };
    }
  },
};
