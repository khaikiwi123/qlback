const User = require("../models/User");
const { verifyRefresh } = require("../Utils/auth");
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

module.exports = {
  login: async (event) => {
    const { email, password } = JSON.parse(event.body);
    const user = await User.findOne({ email: email.trim().toLowerCase() });
    if (!user) {
      throw new Error("User's not found");
    }
    const ismatch = await bcrypt.compare(password.trim(), user.password);
    if (!ismatch) {
      throw new Error("Wrong password");
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
