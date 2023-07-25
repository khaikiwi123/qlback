const User = require("../models/User");
const { hashPassword } = require("../Utils/auth");
const validator = require("validator");
const bcrypt = require("bcryptjs");

module.exports = {
  getUser: async (event) => {
    try {
      const total = await User.estimatedDocumentCount();
      let query = {};

      const {
        pageNumber,
        pageSize,
        role,
        status,
        searchName,
        searchEmail,
        searchPhone,
      } = event.queryStringParameters || {};

      if (role || status || searchName || searchEmail || searchPhone) {
        query = {
          ...(role && { role }),
          ...(status && { status }),
          ...(searchName && { name: new RegExp(searchName, "i") }),
          ...(searchEmail && { email: new RegExp(searchEmail, "i") }),
          ...(searchPhone && { phoneNumber: new RegExp(searchPhone, "i") }),
        };
      }

      let usersQuery = User.find(query).select("-token -password -__v");

      if (pageNumber && pageSize) {
        usersQuery = usersQuery
          .skip((parseInt(pageNumber) - 1) * parseInt(pageSize))
          .limit(parseInt(pageSize));
      }

      const users = await usersQuery;

      if (users.length === 0) {
        throw new Error("No users found");
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

  updateUser: async (event) => {
    const id = event.pathParameters.id;
    const { name, email, oldPassword, newPassword, status, role, phone } =
      JSON.parse(event.body);
    let update = {};

    const currentUser = await User.findById(id);
    if (!currentUser) {
      throw new Error("User does not exist.");
    }

    if (name && name.trim()) update.name = name.trim();
    if (email && email.trim().toLowerCase()) {
      if (!validator.isEmail(email.trim().toLowerCase())) {
        throw new Error("Email isn't valid");
      }
      if (email.trim().toLowerCase() !== currentUser.email) {
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
      if (!oldPassword || !oldPassword.trim()) {
        throw new Error("Please fill out all the form.");
      }
      if (!validator.isStrongPassword(newPassword.trim())) {
        throw new Error("Password isn't strong enough");
      }
      const isMatch = await bcrypt.compare(
        oldPassword.trim(),
        currentUser.password
      );
      if (!isMatch) {
        throw new Error("Old password is incorrect");
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
