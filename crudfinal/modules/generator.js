const { decodeToken } = require("../Utils/auth");
const {
  validateEmail,
  validatePhone,
  validatePassword,
  validateInCharge,
} = require("../Utils/validate");
const User = require("../models/User");

module.exports = {
  getDocuments: async (Model, event, parameters, sort = null) => {
    let query = [];
    const {
      pageNumber,
      pageSize,
      startDate,
      endDate,
      createdDate,
      lastUpdated,
      ...fields
    } = event.multiValueQueryStringParameters || {};

    const getActualValue = (val) => {
      if (Array.isArray(val)) {
        return val[0];
      }
      return val;
    };

    if (startDate || endDate || createdDate) {
      let dateQuery = {};
      if (createdDate) {
        const createdDStart = parseDateString(getActualValue(createdDate));
        createdDStart.setHours(0, 0, 0, 0);

        const createdDEnd = new Date(createdDStart);
        createdDEnd.setHours(23, 59, 59, 999);

        dateQuery.$gte = createdDStart;
        dateQuery.$lte = createdDEnd;
      }

      if (startDate) {
        const startJsDate = parseDateString(getActualValue(startDate));
        startJsDate.setHours(0, 0, 0, 0);
        dateQuery.$gte = startJsDate;
      }

      if (endDate) {
        const endJsDate = parseDateString(getActualValue(endDate));
        endJsDate.setHours(23, 59, 59, 999);
        dateQuery.$lte = endJsDate;
      }

      query.push({ createdDate: dateQuery });
    }
    if (lastUpdated) {
      let lastUp = {};
      const lastUpdate = parseDateString(getActualValue(lastUpdated));
      lastUpdate.setHours(0, 0, 0, 0);
      lastUp.$lte = lastUpdate;

      query.push({ statusUpdate: lastUp });
    }

    for (let key of parameters) {
      if (fields[key]) {
        let orQuery = [];
        if (Array.isArray(fields[key])) {
          for (let value of fields[key]) {
            if (
              value.toLowerCase() === "true" ||
              value.toLowerCase() === "false"
            ) {
              orQuery.push({ [key]: value.toLowerCase() === "true" });
            } else {
              orQuery.push({ [key]: new RegExp(value, "i") });
            }
          }
          query.push({ $or: orQuery });
        } else {
          if (
            fields[key].toLowerCase() === "true" ||
            fields[key].toLowerCase() === "false"
          ) {
            query.push({ [key]: fields[key].toLowerCase() === "true" });
          } else {
            query.push({ [key]: new RegExp(fields[key], "i") });
          }
        }
      }
    }

    const finalQuery = query.length > 1 ? { $and: query } : query[0] || {};

    const total = await Model.countDocuments(finalQuery);

    let modelQuery = Model.find(finalQuery);

    if (sort) {
      modelQuery = modelQuery.sort(sort);
    }

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
    if (inputs.includes("inCharge")) {
      data.inCharge = await validateInCharge(data.inCharge);
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

  updateOne: async (event, inputs, Model, MoveModel, userEmail) => {
    const id = event.pathParameters.id;
    const data = JSON.parse(event.body);
    let update = {};

    for (const field of inputs) {
      const value = data[field];
      if (value) {
        switch (field) {
          case "email":
            update.email = await validateEmail(value, Model, MoveModel);
            break;
          case "phone":
            update.phone = await validatePhone(value, Model, MoveModel);
            break;
          case "inCharge":
            update.inCharge = await validateInCharge(value);
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
      if (data.status && modelData.status !== data.status) {
        update.statusUpdate = Date.now();
      }
      if (data.status === "Success") {
        const newData = modelData.toObject();
        const newInstance = new MoveModel(newData);
        await newInstance.save();
      }

      await Model.findByIdAndUpdate(
        id,
        { ...update, userEmail },
        { new: true }
      );
      if (await MoveModel.findById(id)) {
        await MoveModel.findByIdAndUpdate(id, update, { new: true });
      }

      return `${Model.modelName} updated`;
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

function parseDateString(dateString) {
  const [day, month, year] = dateString.split("/").map(Number);
  return new Date(year, month - 1, day);
}
