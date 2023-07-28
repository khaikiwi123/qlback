const service = require("../services/users");

module.exports = {
  functions: async (event, context, callback, current) => {
    switch (event.httpMethod) {
      case "GET":
        if (event.resource === "/users/{id}") {
          return await getOne(event);
        } else {
          return await get(event);
        }
      case "POST":
        return await create(event);
      case "PUT":
        return await update(event, current);
      case "DELETE":
        return await remove(event);
      default:
        throw new Error("Wrong method");
    }
  },
};

const getOne = async (event) => {
  return await service.getOne(event);
};

const get = async (event) => {
  return await service.getUser(event);
};
const create = async (event) => {
  return await service.createUser(event);
};
const update = async (event, current) => {
  return await service.updateUser(event, current);
};
const remove = async (event) => {
  return await service.deleteUser(event);
};
