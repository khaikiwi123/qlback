const { verifyToken, verifyRole } = require("./auth");
const response = require("./response.js");

module.exports = {
  authenticate: async (event) => {
    try {
      await verifyToken(event);
      return null;
    } catch (err) {
      let message =
        err.message === "Token expired"
          ? "Token expired"
          : "Authentication error";
      return response.createErrorResponse(401, message);
    }
  },

  verifyRole: async (event, requiredRoles) => {
    try {
      const role = await verifyRole(event);
      if (!requiredRoles.includes(role)) {
        throw new Error("Not authorized");
      }
      return null;
    } catch (err) {
      return response.createErrorResponse(403, err.message);
    }
  },
};
