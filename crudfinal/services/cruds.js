const Client = require("../models/Client");
const validator = require("validator");

module.exports = {
  getClient: async (event) => {
    try {
      let query = {};

      const {
        pageNumber,
        pageSize,
        status,
        represent,
        unit,
        email,
        phone,
        userId,
      } = event.queryStringParameters || {};

      if (status || represent || email || phone || unit || userId) {
        query = {
          ...(status && { status }),
          ...(represent && { represent: new RegExp(represent, "i") }),
          ...(email && { email: new RegExp(email, "i") }),
          ...(unit && { unit: new RegExp(unit, "i") }),
          ...(phone && { phone: new RegExp(phone, "i") }),
          ...(userId && { createdBy: new RegExp(userId, "i") }),
        };
      }

      const total = await Client.countDocuments(query);

      let clientsQuery = Client.find(query)
        .select("-__v")
        .sort({ createdDate: -1 });

      if (pageNumber && pageSize) {
        clientsQuery = clientsQuery
          .skip((parseInt(pageNumber) - 1) * parseInt(pageSize))
          .limit(parseInt(pageSize));
      }

      const clients = await clientsQuery;

      return { clients: clients, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOneClient: async (event) => {
    try {
      const id = event.pathParameters.id;
      return await Client.findById(id);
    } catch (error) {
      throw new Error(error.message);
    }
  },

  createClient: async (event) => {
    const { phone, email, unit, represent, status, createdBy } = JSON.parse(
      event.body
    );

    const fields = [phone, email, unit, represent, createdBy];
    if (fields.some((field) => !field || !field.trim())) {
      throw new Error("Please fill out all the form");
    }
    const findOneNumber = await Client.findOne({ phone: phone.trim() });
    const findOneEmail = await Client.findOne({
      email: email.trim().toLowerCase(),
    });
    if (findOneEmail) {
      throw new Error("Client's email is already in the system");
    }
    if (findOneNumber) {
      throw new Error("Client's number is already in the system");
    }
    if (!validator.isEmail(email.trim().toLowerCase())) {
      throw new Error("Email isn't valid");
    }

    try {
      const newClient = new Client({
        email: email.trim(),
        phone: phone.trim(),
        unit: unit.trim(),
        represent: represent.trim(),
        createdBy: createdBy.trim(),
        status,
      });
      await newClient.save();

      return "Client created";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateClient: async (event) => {
    const id = event.pathParameters.id;
    const { phone, email, unit, represent, status, createdBy } = JSON.parse(
      event.body
    );
    let update = {};

    if (email && email.trim().toLowerCase()) {
      if (!validator.isEmail(email.trim().toLowerCase())) {
        throw new Error("Email isn't valid");
      }
      const findOneEmail = await Client.findOne({
        email: email.trim().toLowerCase(),
      });
      if (findOneEmail) {
        throw new Error("Email already in use, please choose a different one.");
      }

      update.email = email.trim().toLowerCase();
    }
    if (phone && phone.trim()) {
      const findOneNumber = await Client.findOne({
        phone: phone.trim(),
      });
      if (findOneNumber) {
        throw new Error(
          "Phone number already in use, please choose a different one."
        );
      }

      update.phone = phone.trim();
    }
    if (unit && unit.trim()) update.unit = unit.trim();
    if (represent && represent.trim()) update.represent = represent.trim();
    if (createdBy && createdBy.trim()) update.createdBy = createdBy.trim();
    if (status !== undefined) update.status = status;

    try {
      await Client.findByIdAndUpdate(id, update, { new: true });
      return "Customer updated";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteClient: async (event) => {
    const id = event.pathParameters.id;

    try {
      await Client.findByIdAndDelete(id);
      return "Customer deleted";
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
