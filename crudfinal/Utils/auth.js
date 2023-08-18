const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

module.exports = {
  hashPassword: async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
  },
  verifyToken: async (event) => {
    try {
      const token = await getToken(event);
      jwt.verify(token, process.env.SECRET);
      return true;
    } catch (err) {
      if (err instanceof jwt.TokenExpiredError) {
        throw new Error("Token expired");
      } else if (err instanceof jwt.JsonWebTokenError) {
        throw new Error("Invalid token");
      } else {
        throw new Error("Token verification failed");
      }
    }
  },
  verifyRefresh: async (event) => {
    const token = await getToken(event);
    const refresh = jwt.verify(token, process.env.SECRET);
    if (!refresh) {
      throw new Error("Refresh token is not valid");
    }
    const user = await User.findOne({ _id: refresh.userId });
    if (token !== user.token) {
      throw new Error("Token used or invalidated");
    }
    if (user.status !== true) {
      throw new Error("Account deactivated, please contact admin");
    }
    return user;
  },
  verifyRole: async (event) => {
    const token = await getToken(event);
    if (!token) {
      throw new Error("No token provided");
    }
    const decodedToken = jwt.decode(token, process.env.SECRET);
    const role = decodedToken.role;
    return role;
  },
  verifyCurrent: async (event) => {
    try {
      const token = await getToken(event);
      const id = event.pathParameters.id;
      const current = jwt.verify(token, process.env.SECRET);

      const isAdmin = current.role === "admin";
      const isCurrentUser = current.userId == id;

      if (!isCurrentUser && !isAdmin) {
        throw new Error("Unauthorized access");
      }
      return current;
    } catch (error) {
      console.error("Error verifying token:", error);
      if (error.message === "Unauthorized access") {
        error.statusCode = 403;
      }
      throw error;
    }
  },
  decodeToken: async (event) => {
    const token = await getToken(event);
    return jwt.verify(token, process.env.SECRET);
  },
};

const getToken = async (event) => {
  const header = event.headers.Authorization;
  if (!header || header === "Bearer null") {
    throw new Error("Invalid authorization header");
  }
  const token = await header.replace(/^Bearer\s+/, "");
  return token;
};
