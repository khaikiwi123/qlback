const validator = require("validator");
const { hashPassword } = require("./auth");

module.exports = {
  validateEmail: async (email, Model) => {
    if (!validator.isEmail(email.trim().toLowerCase())) {
      throw new Error("Email isn't valid");
    }
    const findOneEmail = await Model.findOne({
      email: email.trim().toLowerCase(),
    });
    if (findOneEmail) {
      const error = new Error("Email existed");
      error.id = findOneEmail._id;
      error.inCharge = findOneEmail.inCharge;
      throw error;
    }
    return email.trim().toLowerCase();
  },

  validatePhone: async (phone, Model) => {
    const findOneNumber = await Model.findOne({ phone: phone.trim() });
    if (findOneNumber) {
      const error = new Error("Phone existed");
      error.id = findOneNumber._id;
      error.inCharge = findOneNumber.inCharge;
      throw error;
    }
    return phone.trim();
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
