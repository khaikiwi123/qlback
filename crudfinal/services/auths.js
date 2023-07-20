const User = require("../models/User");
const {
  hashPassword,
  comparePassword,
  verifyRefresh,
} = require("../Utils/auth");
const validator = require("validator");
const jwt = require("jsonwebtoken");

module.exports = {
  register: async (event) => {
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
    if (role !== "user" && role !== "admin" && role !== "") {
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
    await user.save();
    return "User created";
  },

  login: async (event) => {
    const { email, password } = JSON.parse(event.body);
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      throw new Error("User's not found");
    }
    const isMatch = await comparePassword(password.trim(), user.password);
    if (!isMatch) {
      throw new Error("Invalid Password");
    }
    if (user.status !== true) {
      throw new Error("Account deactivated, please contact admin");
    }
    const aToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET,
      { expiresIn: "5m" }
    );
    const rToken = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "3d",
    });

    user.token = rToken;
    await user.save();

    return {
      id: user._id,
      role: user.role,
      access: aToken,
      refresh: rToken,
    };
  },
  logout: async (event) => {
    const header = event.headers.Authorization;
    if (!header || header === "Bearer null") {
      throw new Error("Not logged in");
    }
    const token = await header.replace(/^Bearer\s+/, "");
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id: decodedToken.userId });
    if (user.token === "") {
      throw new Error("Already logged out");
    }
    if (token !== user.token) {
      throw new Error("Token used or invalidated");
    }
    user.token = "";
    await user.save();
    return "Logged out";
  },
  refresh: async (event) => {
    const user = await verifyRefresh(event);
    if (!user) {
      throw new Error("Invalid token or refresh token");
    }
    const aToken = jwt.sign(
      { userId: user._id, role: user.role },
      process.env.SECRET,
      { expiresIn: "5m" }
    );
    const rToken = jwt.sign({ userId: user._id }, process.env.SECRET, {
      expiresIn: "3d",
    });
    user.token = rToken;
    await user.save();

    return {
      access: aToken,
      refresh: rToken,
    };
  },
};
