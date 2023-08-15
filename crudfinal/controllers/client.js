const service = require("../services/clients.js");

module.exports = {
  functions: async (event, context, userEmail, callback) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/clients/{id}") {
          return await getOneClient(event);
        } else {
          return await get(event);
        }
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
  return await service.getClient(event);
};
const getOneClient = async (event) => {
  return await service.getOneClient(event);
};

const update = async (event, userEmail) => {
  return await service.updateClient(event, userEmail);
};
const remove = async (event) => {
  return await service.deleteClient(event);
};
