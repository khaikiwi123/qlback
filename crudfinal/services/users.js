const User = require("../models/User");
const { hashPassword } = require("../Utils/auth");
const validator = require("validator");

module.exports = {
  getUser: async () => {
    return await User.find().select("-_id -token");
  },
  getOne: async (event) => {
    const id = event.pathParameters.id;
    const user = await User.findById(id).select("-_id -token");
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
    const { email, password } = JSON.parse(event.body);
    await User.findByIdAndUpdate(
      id,
      { email: email, password: password },
      { new: true }
    );
    return "User updated";
  }, //need more work
  deleteUser: async (event) => {
    const id = event.pathParameters.id;
    await User.findByIdAndDelete(id);
    return "User deleted or no longer exist";
  },
};
