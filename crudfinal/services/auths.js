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
    if (fields.some(field => !field || !field.trim()))  {
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

  login: async (event) => {
    const { email, password } = JSON.parse(event.body);
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      return "User's not found";
    }
    const isMatch = await comparePassword(password.trim(), user.password);
    if (!isMatch) {
      return "Invalid Password";
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
      access: aToken,
      refresh: rToken,
    };
  },
  logout: async (event) => {
    const header = event.headers.Authorization;
    if (!header || header === "Bearer null") {
      return "Not logged in";
    }
    const token = await header.replace(/^Bearer\s+/, "");
    const decodedToken = jwt.verify(token, process.env.SECRET);
    const user = await User.findOne({ _id: decodedToken.userId });
    if (user.token === "") {
      return "Already logged out";
    }
    if (token !== user.token) {
      return "Token used or invalidated";
    }
    user.token = "";
    await user.save();
    return "Logged out";
  },
  refresh: async (event) => {
    const user = await verifyRefresh(event);
    if (
      user === "Token used or invalidated" ||
      user === "Refresh token is not valid"
    ) {
      return user ? "Token used or invalidated" : "Refresh token is not valid";
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
