const { verifyToken, verifyRole } = require("./auth");
const response = require("./response.js");

module.exports = {
  authenticate: async (event) => {
    const tokenVerify = await verifyToken(event);
    if (!tokenVerify || tokenVerify === "expired") {
      let message = tokenVerify === "expired" ? "Token expired" : "Authentication error";
      return response.createErrorResponse(401, message);
    }
    return null;
  },

  verifyRole: async (event, requiredRoles) => {
    const role = await verifyRole(event);
    if (!requiredRoles.includes(role)) {
      return response.createErrorResponse(403, "Not authorized");
    }
    return null;
  }
};
