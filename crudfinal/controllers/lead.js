const service = require("../services/leads.js");

module.exports = {
  functions: async (event, context, userEmail, callback) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/leads/{id}") {
          return await service.getOneLead(event);
        } else {
          return await service.getLead(event);
        }
      case "POST":
        return await service.createLead(event);
      case "PUT":
        return await service.updateLead(event, userEmail);
      case "DELETE":
        return await service.deleteLead(event);
      default:
        return {
          statusCode: 500,
          body: "wrong method",
        };
    }
  },
};
