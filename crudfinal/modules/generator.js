const { decodeToken } = require("../Utils/auth");
const { validateEmail, validatePhone } = require("../Utils/validate");
const User = require("../models/User");

module.exports = {
  getDocuments: async (Model, event, parameters) => {
    let query = {};
    const { pageNumber, pageSize, ...fields } =
      event.queryStringParameters || {};

    for (let key of parameters) {
      if (fields[key]) {
        if (
          fields[key].toLowerCase() === "true" ||
          fields[key].toLowerCase() === "false"
        ) {
          query = {
            ...query,
            [key]: fields[key].toLowerCase() === "true",
          };
        } else {
          query = {
            ...query,
            [key]: new RegExp(fields[key], "i"),
          };
        }
      }
    }

    const total = await Model.countDocuments(query);

    let modelQuery = Model.find(query);

    if (pageNumber && pageSize) {
      modelQuery = modelQuery
        .skip((parseInt(pageNumber) - 1) * parseInt(pageSize))
        .limit(parseInt(pageSize));
    }

    const documents = await modelQuery;

    return { documents, total };
  },
  getOne: async (event, EntityType, errorMessage) => {
    try {
      const entityId = event.pathParameters.id;
      const decodedToken = await decodeToken(event);
      const userId = decodedToken.userId;

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const entity = await EntityType.findById(entityId);
      if (!entity) {
        throw new Error(`${errorMessage} not found`);
      }

      if (entity.inCharge !== user.email && user.role !== "admin") {
        const error = new Error("Not authorized");
        error.inCharge = entity.inCharge;
        throw error;
      }

      return entity;
    } catch (error) {
      throw error;
    }
  },
};
