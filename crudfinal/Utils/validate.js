const validator = require("validator");
const { hashPassword } = require("./auth");
const User = require("../models/User");

module.exports = {
  validateEmail: async (email, Model, MoveModel) => {
    email = email.trim().toLowerCase();

    if (!validator.isEmail(email)) {
      throw new Error("Email isn't valid");
    }

    const collectionsToCheck = [Model];

    if (MoveModel) collectionsToCheck.push(MoveModel);

    for (const collection of collectionsToCheck) {
      const existingDoc = await collection.findOne({ email });

      if (existingDoc) {
        const error = new Error("Email existed");
        error.id = existingDoc._id;
        error.inCharge = existingDoc.inCharge;
        error.type = collection.modelName;
        throw error;
      }
    }

    return email;
  },

  validatePhone: async (phone, Model, MoveModel) => {
    phone = phone.trim();
    if (!validator.isMobilePhone(phone, ["vi-VN"])) {
      throw new Error("Phone isn't valid");
    }

    const collectionsToCheck = [Model];

    if (MoveModel) collectionsToCheck.push(MoveModel);

    for (const collection of collectionsToCheck) {
      const existingDoc = await collection.findOne({ phone });

      if (existingDoc) {
        const error = new Error("Phone existed");
        error.id = existingDoc._id;
        error.inCharge = existingDoc.inCharge;
        error.type = collection.modelName;
        throw error;
      }
    }

    return phone;
  },
  validateInCharge: async (inCharge) => {
    inCharge = inCharge.trim().toLowerCase();
    const findInCharge = await User.findOne({
      email: inCharge,
    });
    if (!findInCharge) {
      throw new Error("Sale user doesn't exist");
    }
    return inCharge;
  },

  validatePassword: async (password) => {
    if (password.trim().length > 18) {
      throw new Error("Password is too long");
    }
    if (!validator.isStrongPassword(password.trim())) {
      throw new Error("Password isn't strong enough");
    }

    return await hashPassword(password.trim());
  },
};
