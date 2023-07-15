const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  },
  comparePassword: async (password, hashedPassword) => {
    const ismatch = await bcrypt.compare(password, hashedPassword);
    return ismatch;
  },
  verifyToken: async (event) => {
    try {
      const token = await getToken(event);
      jwt.verify(token, process.env.SECRET);
      return true;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        return "expired";
      } else {
        return false;
      }
    }
  },
  verifyRole: async (event) => {
    const token = await getToken(event);
    const decodedToken = jwt.decode(token, process.env.SECRET);
    const role = decodedToken.role;
    return role;
  },
  verifyRefresh: async (event) => {
    const token = await getToken(event);
    const refresh = jwt.verify(token, process.env.SECRET);
    if (!refresh) {
      return "Refresh token is not valid";
    }
    const user = await User.findOne({ _id: refresh.userId });
    if (token !== user.token) {
      return "Token used or invalidated";
    }
    return user;
  },
  verifyCurrent: async (event) => {
    try {
      const token = await getToken(event);
      const id = event.pathParameters.id;
      const current = jwt.verify(token, process.env.SECRET);

      const isAdmin = current.role === "admin";
      const isCurrentUser = current.userId == id;

      console.log(
        `current.userId: ${current.userId}, id: ${id}, isAdmin: ${isAdmin}`
      );

      return isCurrentUser || isAdmin;
    } catch (error) {
      console.error("Error verifying token:", error);
      return false;
    }
  },
};

const getToken = async (event) => {
  const header = event.headers.Authorization;
  if (!header || header === "Bearer null") {
    return false;
  }
  const token = await header.replace(/^Bearer\s+/, "");
  return token;
};
