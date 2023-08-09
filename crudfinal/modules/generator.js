const { decodeToken } = require("../Utils/auth");
const {
  validateEmail,
  validatePhone,
  validatePassword,
} = require("../Utils/validate");
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
  createOne: async (event, inputs, Model) => {
    const data = JSON.parse(event.body);

    if (inputs.some((field) => !data[field] || !data[field].trim())) {
      throw new Error("Please fill out all the form");
    }
    if (inputs.includes("email")) {
      data.email = await validateEmail(data.email, Model);
    }
    if (inputs.includes("phone")) {
      data.phone = await validatePhone(data.phone, Model);
    }
    if (inputs.includes("password")) {
      data.password = await validatePassword(data.password);
    }

    if (data.role && !["user", "admin"].includes(data.role)) {
      throw new Error("Invalid role");
    }

    const entry = new Model(data);

    try {
      await entry.save();
      return `${Model.modelName} created`;
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateOne: async (event, inputs, Model, statusConfig, MoveModel) => {
    const id = event.pathParameters.id;
    const data = JSON.parse(event.body);
    let update = {};

    for (const field of inputs) {
      const value = data[field];
      if (value) {
        switch (field) {
          case "email":
            update.email = await validateEmail(value, Model);
            break;
          case "phone":
            update.phone = await validatePhone(value, Model);
            break;
          default:
            update[field] = typeof value === "string" ? value.trim() : value;
        }
      }
    }

    try {
      let modelData = await Model.findById(id);

      if (!modelData) {
        throw new Error("Data not found");
      }

      if (data.status === statusConfig.trigger) {
        const newData = modelData.toObject();
        newData.status = statusConfig.movingStatus;

        const newInstance = new MoveModel(newData);
        await newInstance.save();

        await Model.findByIdAndDelete(id);
        return `${Model.modelName} moved to ${MoveModel.modelName}`;
      } else {
        await Model.findByIdAndUpdate(id, update, { new: true });
        return `${Model.modelName} updated`;
      }
    } catch (error) {
      throw new Error(error.message);
    }
  },
  deleteOne: async (event, Model) => {
    const id = event.pathParameters.id;

    try {
      const result = await Model.findByIdAndDelete(id);
      if (!result) {
        throw new Error(`${Model.modelName} not found`);
      }
      return `${Model.modelName} deleted`;
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
