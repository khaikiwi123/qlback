const authControl = require("../controllers/auth.js");
const leadControl = require("../controllers/lead.js");
const customerControl = require("../controllers/customer.js");
const userControl = require("../controllers/user.js");
const logControl = require("../controllers/log.js");
const billControl = require("../controllers/bill.js");
const productControl = require("../controllers/product.js");
const { verifyCurrent, decodeToken } = require("../Utils/auth.js");
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
  handleLeads: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }

      const roleError = await verifyRole(event, ["user", "admin"]);
      if (roleError) {
        return roleError;
      }
      const decoded = await decodeToken(event);
      const userEmail = decoded.email;

      const leads = await leadControl.functions(
        event,
        context,
        userEmail,
        callback
      );
      return createSuccessResponse(leads);
    } catch (error) {
      console.log(error);
      return createErrorResponse(
        500,
        error.message,
        error.id,
        error.inCharge,
        error.type
      );
    }
  },
  handleCustomers: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }

      const roleError = await verifyRole(event, ["user", "admin"]);
      if (roleError) {
        return roleError;
      }

      const decoded = await decodeToken(event);
      const userEmail = decoded.email;

      const customers = await customerControl.functions(
        event,
        context,
        userEmail,
        callback
      );
      return createSuccessResponse(customers);
    } catch (error) {
      console.log(error);
      return createErrorResponse(
        500,
        error.message,
        error.id,
        error.inCharge,
        error.type
      );
    }
  },
  handleLeadLog: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }

      const roleError = await verifyRole(event, ["user", "admin"]);
      if (roleError) {
        return roleError;
      }
      const logs = await logControl.getChangeLog(event, "Lead");
      return createSuccessResponse(logs);
    } catch (error) {
      console.log(error);
      return createErrorResponse(500, error.message);
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
  handleProducts: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }
      if (event.httpMethod !== "GET") {
        const roleError = await verifyRole(event, ["admin"]);
        if (roleError) {
          return roleError;
        }
      }

      const products = await productControl.functions(event, context, callback);
      return createSuccessResponse(products);
    } catch (error) {
      return createErrorResponse(500, error.message);
    }
  },
  handleBill: async (event, context, callback) => {
    try {
      const authError = await authenticate(event);
      if (authError) {
        return authError;
      }

      const roleError = await verifyRole(event, ["user", "admin"]);
      if (roleError) {
        return roleError;
      }
      const bills = await billControl.functions(event, context, callback);
      return createSuccessResponse(bills);
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
      const statusCode = error.statusCode || 500;
      return createErrorResponse(statusCode, error.message);
    }
  },
};
