const User = require("../models/User");
const { hashPassword } = require("../Utils/auth");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { sortedName } = require("../Utils/sort");

module.exports = {
  getUser: async (event) => {
    try {
      let query = {};

      const { pageNumber, pageSize, role, status, name, email, phone } =
        event.queryStringParameters || {};

      if (role || status || name || email || phone) {
        query = {
          ...(role && { role }),
          ...(status && { status }),
          ...(name && { name: new RegExp(name, "i") }),
          ...(email && { email: new RegExp(email, "i") }),
          ...(phone && { phoneNumber: new RegExp(phone, "i") }),
        };
      }
      const total = await User.countDocuments(query);

      let usersQuery = User.find(query).select("-token -password -__v");

      let users = await usersQuery;

      users = users.sort(sortedName);

      if (pageNumber && pageSize) {
        users = users.slice(
          (parseInt(pageNumber) - 1) * parseInt(pageSize),
          parseInt(pageNumber) * parseInt(pageSize)
        );
      }

      return { users: users, total: total };
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
    const { name, email, password, role, phone } = JSON.parse(event.body);
    const fields = [name, email, password, phone];
    if (fields.some((field) => !field || !field.trim())) {
      throw new Error("Please fill out all the form");
    }
    const findOneEmail = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (findOneEmail) {
      throw new Error("User already existed, please login.");
    }
    if (!validator.isEmail(email.trim().toLowerCase())) {
      throw new Error("Email isn't valid");
    }
    if (password.trim().length > 18) {
      throw new Error("Password is too long");
    }
    if (!validator.isStrongPassword(password.trim())) {
      throw new Error("Password isn't strong enough");
    }
    if (!["user", "admin"].includes(role)) {
      throw new Error("Invalid role");
    }
    const hashedPassword = await hashPassword(password.trim());
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone.trim(),
    });

    try {
      await user.save();
      return "User created";
    } catch (error) {
      throw new Error(error.message);
    }
  },

  updateUser: async (event, current) => {
    const id = event.pathParameters.id;
    const { name, email, oldPassword, newPassword, status, role, phone } =
      JSON.parse(event.body);
    let update = {};

    const userToUpdate = await User.findById(id);
    if (!userToUpdate) {
      throw new Error("User does not exist.");
    }

    const isAdmin = current.role === "admin";

    if (name && name.trim()) update.name = name.trim();
    if (email && email.trim().toLowerCase()) {
      if (!validator.isEmail(email.trim().toLowerCase())) {
        throw new Error("Email isn't valid");
      }
      if (email.trim().toLowerCase() !== userToUpdate.email) {
        const findOneEmail = await User.findOne({
          email: email.trim().toLowerCase(),
        });
        if (findOneEmail) {
          throw new Error(
            "Email already in use, please choose a different one."
          );
        }
      }
      update.email = email.trim().toLowerCase();
    }
    if (phone && phone.trim()) update.phone = phone.trim();
    if (role) update.role = role;
    if (status !== undefined) {
      update.status = status;
      if (!status) {
        update.token = "";
      }
    }
    if (newPassword && newPassword.trim()) {
      if (!isAdmin && (!oldPassword || !oldPassword.trim())) {
        throw new Error("Please fill out all the form.");
      }
      if (newPassword.trim().length > 18) {
        throw new Error("Password is too long");
      }
      if (!validator.isStrongPassword(newPassword.trim())) {
        throw new Error("Password isn't strong enough");
      }
      if (!isAdmin) {
        const isMatch = await bcrypt.compare(
          oldPassword.trim(),
          userToUpdate.password
        );
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
    const id = event.pathParameters.id;
    try {
      await User.findByIdAndDelete(id);
      return "User deleted or no longer exists";
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
