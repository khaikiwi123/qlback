const User = require("../models/User");
const bcrypt = require("bcryptjs");
const { sortedName } = require("../Utils/sort");
const { getDocuments, deleteOne, createOne } = require("../modules/generator");
const {
  validateEmail,
  validatePhone,
  validatePassword,
} = require("../Utils/validate");

module.exports = {
  getUser: async (event) => {
    try {
      const { documents, total } = await getDocuments(User, event, [
        "role",
        "status",
        "name",
        "email",
        "phone",
      ]);
      // documents.sort(sortedName);
      return { users: documents, total: total };
    } catch (error) {
      throw new Error(error.message);
    }
  },
  getOne: async (event) => {
    const id = event.pathParameters.id;
    const user = await User.findById(id).select("-token -password -__v");
    if (!user) {
      throw new Error("User doesn't exist");
    }
    return user;
  },

  createUser: async (event) => {
    const inputs = ["name", "email", "password", "phone", "role"];
    return await createOne(event, inputs, User);
  },

  updateUser: async (event, current) => {
    const id = event.pathParameters.id;
    const { name, email, oldPassword, newPassword, status, role, phone } =
      JSON.parse(event.body);
    let update = {};

    const user = await User.findById(id);
    if (!user) {
      throw new Error("User does not exist.");
    }

    const isAdmin = current.role === "admin";

    if (name && name.trim()) update.name = name.trim();

    if (email && email.trim().toLowerCase() !== user.email) {
      await validateEmail(email, User);
      update.email = email.trim().toLowerCase();
    }

    if (phone && phone.trim()) {
      update.phone = await validatePhone(phone, User);
    }

    if (role) update.role = role;

    if (status !== undefined) {
      update.status = status;
      if (!status) {
        update.token = "";
      }
    }

    if (newPassword && newPassword.trim()) {
      validatePassword(newPassword);

      if (!isAdmin) {
        if (!oldPassword || !oldPassword.trim()) {
          throw new Error("Please fill out all the form.");
        }
        const isMatch = await bcrypt.compare(oldPassword.trim(), user.password);
        if (!isMatch) {
          throw new Error("Old password is incorrect");
        }
      }
      update.password = await bcrypt.hash(newPassword.trim(), 10);
    }

    try {
      await User.findByIdAndUpdate(id, update, { new: true });
      return "User updated";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  deleteUser: async (event) => {
    return await deleteOne(event, User);
  },
};
