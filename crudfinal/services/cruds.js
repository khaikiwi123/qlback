const Client = require("../models/Client");
const validator = require("validator");
const { decodeToken } = require("../Utils/auth");
const User = require("../models/User");
const { getDocuments } = require("../modules/generator");

module.exports = {
  getClient: async (event) => {
    try {
      const { documents, total } = await getDocuments(Client, event, [
        "status",
        "represent",
        "org",
        "email",
        "phone",
        "userId",
      ]);
      return { clients: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },

  getOneClient: async (event) => {
    try {
      const clientId = event.pathParameters.id;
      const decodedToken = await decodeToken(event);
      const userId = decodedToken.userId;

      const user = await User.findById(userId);
      if (!user) {
        throw new Error("User not found");
      }

      const client = await Client.findById(clientId);
      if (!client) {
        throw new Error("Client not found");
      }

      if (client.inCharge !== user.email && user.role !== "admin") {
        const error = new Error("Not authorized");
        error.inCharge = client.inCharge;
        throw error;
      }

      return client;
    } catch (error) {
      throw error;
    }
  },

  createClient: async (event) => {
    const { phone, email, org, represent, status, inCharge } = JSON.parse(
      event.body
    );

    const fields = [phone, email, org, represent, inCharge];
    if (fields.some((field) => !field || !field.trim())) {
      throw new Error("Please fill out all the form");
    }

    const findOneNumber = await Client.findOne({ phone: phone.trim() });
    const findOneEmail = await Client.findOne({
      email: email.trim().toLowerCase(),
    });
    const findOneInCharge = await User.findOne({
      email: inCharge.trim().toLowerCase(),
    });

    if (findOneEmail) {
      const error = new Error("Client's email is already in the system");
      error.id = findOneEmail._id;
      throw error;
    }
    if (findOneNumber) {
      const error = new Error("Client's number is already in the system");
      error.id = findOneNumber._id;
      throw error;
    }
    if (!findOneInCharge) {
      throw new Error("Sale user doesn't exist");
    }

    if (!validator.isEmail(email.trim().toLowerCase())) {
      throw new Error("Email isn't valid");
    }

    try {
      const newClient = new Client({
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        org: org.trim(),
        represent: represent.trim(),
        inCharge: inCharge.trim().toLowerCase(),
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
    const { phone, email, org, represent, status, inCharge } = JSON.parse(
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
        const error = new Error(
          "Email already in use, please choose a different one."
        );
        error.id = findOneEmail._id;
        throw error;
      }

      update.email = email.trim().toLowerCase();
    }
    if (phone && phone.trim()) {
      const findOneNumber = await Client.findOne({
        phone: phone.trim(),
      });
      if (findOneNumber) {
        const error = new Error(
          "Phone number already in use, please choose a different one."
        );
        error.id = findOneNumber._id;
        throw error;
      }

      update.phone = phone.trim();
    }
    if (org && org.trim()) update.org = org.trim();
    if (represent && represent.trim()) update.represent = represent.trim();
    if (inCharge && inCharge.trim()) update.inCharge = inCharge.trim();
    if (status) update.status = status;

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
