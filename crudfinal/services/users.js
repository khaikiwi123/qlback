const User = require("../models/User");
const { hashPassword, comparePassword } = require("../Utils/auth");
const validator = require("validator");

module.exports = {
  getUser: async () => {
    return await User.find().select("-token");
  },
  getOne: async (event) => {
    const id = event.pathParameters.id;
    const user = await User.findById(id).select("-token");
    return user;
  },
  createUser: async (event) => {
    const { name, email, password, role, phone } = JSON.parse(event.body);
    if (!name.trim() || !email.trim() || !password.trim() || !phone.trim()) {
      return "Please fill out all the form";
    }
    const findOneEmail = await User.findOne({
      email: email.trim().toLowerCase(),
    });
    if (findOneEmail) {
      return "User already existed, please login.";
    }
    if (!validator.isEmail(email.trim().toLowerCase())) {
      return "Email isn't valid";
    }
    if (!validator.isStrongPassword(password.trim())) {
      return "Password isn't strong enough";
    }
    if (role !== "user" && role !== "admin" && role !== "") {
      return "Invalid role";
    }
    const hashedPassword = await hashPassword(password.trim());
    const user = new User({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password: hashedPassword,
      role,
      phone: phone.trim(),
    });
    await user.save();
    return "User created";
  },
  updateUser: async (event) => {
    const id = event.pathParameters.id;
    const { name, email, oldPassword, newPassword, status, role, phone } = JSON.parse(event.body);
    let update = {};

    if (name && name.trim()) update.name = name.trim();
    if (email && email.trim().toLowerCase())
      update.email = email.trim().toLowerCase();
    if (phone && phone.trim()) update.phone = phone.trim();
    if (role) update.role = role;
    if (status) update.status = status;
    if (newPassword && newPassword.trim()) {
      if (!oldPassword || !oldPassword.trim()) {
        throw new Error("Please fill out all the form.");
      }
      if (!validator.isStrongPassword(newPassword.trim())) {
        return "Password isn't strong enough";
      }
      
      const user = await User.findById(id);
      const isMatch = await comparePassword(oldPassword, user.password);

      if (isMatch) {
        update.password = await hashPassword(newPassword.trim()); 
      } else {
        throw new Error("Old password is incorrect.");
      }
    }

    await User.findByIdAndUpdate(id, update, { new: true });

    return "user updated";
  },



  deleteUser: async (event) => {
    const id = event.pathParameters.id;
    await User.findByIdAndDelete(id);
    return "User deleted or no longer exist";
  },
};
