const authControl = require("../controllers/auth.js");
const crudControl = require("../controllers/crud.js");
const userControl = require("../controllers/user.js");
const { verifyCurrent } = require("../Utils/auth.js");
const { authenticate, verifyRole } = require("../Utils/authentication.js");
const {
  createErrorResponse,
  createSuccessResponse,
} = require("../Utils/response.js");

module.exports = {
  handleLogin: async (event, context, callback) => {
    try {
      const auth = await authControl.functions(event, context, callback);
      const { refresh, access, id, role, user } = auth;
      return createSuccessResponse({ access, refresh, id, role, user });
    } catch (error) {
      return createErrorResponse(500, error.message);
    }
  },
  handleAuth: async (event, context, callback) => {
    try {
      const auth = await authControl.functions(event, context, callback);
      return createSuccessResponse(auth);
    } catch (error) {
      return createErrorResponse(401, error.message);
    }
  },
  handleClients: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }

      const roleError = await verifyRole(event, ["user", "admin"]);
      if (roleError) {
        return roleError;
      }

      const clients = await crudControl.functions(event, context, callback);
      return createSuccessResponse(clients);
    } catch (error) {
      return createErrorResponse(500, error.message, error.id); // Pass the error's id to createErrorResponse
    }
  },

  handleAllUsers: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }

      const roleError = await verifyRole(event, ["admin"]);
      if (roleError) {
        return roleError;
      }

      const users = await userControl.functions(event, context, callback);
      return createSuccessResponse(users);
    } catch (error) {
      return createErrorResponse(500, error.message);
    }
  },
  handleSingleUser: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }

      const current = await verifyCurrent(event);
      if (!current) {
        return createErrorResponse(403, "Not authorized");
      }

      const user = await userControl.functions(
        event,
        context,
        callback,
        current
      );
      return createSuccessResponse(user);
    } catch (error) {
      return createErrorResponse(500, error.message);
    }
  },
};
