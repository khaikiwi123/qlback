const authControl = require("../controllers/auth.js");
const crudControl = require("../controllers/crud.js");
const userControl = require("../controllers/user.js");
const {verifyCurrent} = require("../Utils/auth.js")
const { authenticate, verifyRole} = require("../Utils/authentication.js");
const { createErrorResponse, createSuccessResponse } = require("../Utils/response.js");

exports.handleLogin = async (event, context, callback) => {
  try {
    const auth = await authControl.functions(event, context, callback);
    const { refresh, access, id, role } = auth;
    return createSuccessResponse({ access, refresh, id, role });
  } catch (error) {
    return createErrorResponse(400, error.message);
  }
};

exports.handleAuth = async (event, context, callback) => {
  try {
    const auth = await authControl.functions(event, context, callback);
    return createSuccessResponse(auth);
  } catch (error) {
    return createErrorResponse(400, error.message);
  }
};

exports.handleKhachs = async (event, context, callback) => {
  try {
    const authError = await authenticate(event);
    if (authError) {
      return authError;
    }

    const roleError = await verifyRole(event, ["user", "admin"]);
    if (roleError) {
      return roleError;
    }

    const khachs = await crudControl.functions(event, context, callback);
    return createSuccessResponse(khachs);
  } catch (error) {
    return createErrorResponse(400, error.message);
  }
};

exports.handleAllUsers = async (event, context, callback) => {
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
    return createErrorResponse(400, error.message);
  }
};

exports.handleSingleUser = async (event, context, callback) => {
  try {
    const authError = await authenticate(event);
    if (authError) {
      return authError;
    }

    const isAuthorized = await verifyCurrent(event);
    if (!isAuthorized) {
      return createErrorResponse(403, "Not authorized");
    }

    const user = await userControl.functions(event, context, callback);
    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(400, error.message);
  }
};
