const service = require("../services/leads.js");

module.exports = {
  functions: async (event, context, userEmail, callback) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/leads/{id}") {
          return await getOneLead(event);
        } else {
          return await get(event);
        }
      case "POST":
        return await create(event);
      case "PUT":
        return await update(event, userEmail);
      case "DELETE":
        return await remove(event);
      default:
        return {
          statusCode: 500,
          body: "wrong method",
        };
    }
  },
};

const get = async (event) => {
  return await service.getLead(event);
};
const getOneLead = async (event) => {
  return await service.getOneLead(event);
};
const create = async (event) => {
  return await service.createLead(event);
};
const update = async (event, userEmail) => {
  return await service.updateLead(event, userEmail);
};
const remove = async (event) => {
  return await service.deleteLead(event);
};
