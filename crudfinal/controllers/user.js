const service = require("../services/users");

module.exports = {
  functions: async (event, context, callback, current) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/users/{id}") {
          return await service.getOne(event);
        } else {
          return await service.getUser(event);
        }
      case "POST":
        return await service.createUser(event);
      case "PUT":
        return await service.updateUser(event, current);
      case "DELETE":
        return await service.deleteUser(event);
      default:
        throw new Error("Wrong method");
    }
  },
};
