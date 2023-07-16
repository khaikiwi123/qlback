const mongoose = require("mongoose");
const crudControl = require("./controllers/crud.js");
const authControl = require("./controllers/auth.js");
const userControl = require("./controllers/user.js");
const { verifyCurrent } = require("./Utils/auth.js");
const { createErrorResponse, createSuccessResponse } = require("./Utils/response.js");
const { authenticate, verifyRole } = require("./Utils/authentication.js");

let conn = null;

const connectToDB = async (uri, option = {}) => {
  if (conn == null) {
    conn = await mongoose.connect(uri, option);
  }
};

exports.handler = async (event, context, callback) => {
  context.callbackWaitsForEmptyEventLoop = false;
  await connectToDB(process.env.MONGODB_URI);

  switch (event.resource) {
    case "/auth/refresh":
    case "/auth/register":
    case "/auth/logout":
      return handleAuth(event, context, callback);
    case "/auth/login":
      return handleLogin(event, context, callback);
    case "/khachs":
    case "/khachs/{id}":
      return handleKhachs(event, context, callback);
    case "/users":
      return handleAllUsers(event, context, callback);
    case "/users/{id}":
      return handleSingleUser(event, context, callback);
    default:
      return createErrorResponse(404, "Path not found");
  }
};

const handleLogin = async (event, context, callback) => {
  const auth = await authControl.functions(event, context, callback);
  if (auth === "User's not found" || auth === "Invalid Password") {
    return createSuccessResponse(auth);
  }
  const { refresh, access, id } = auth;
  return createSuccessResponse({ access, refresh, id });
};

const handleAuth = async (event, context, callback) => {
  const auth = await authControl.functions(event, context, callback);
  return createSuccessResponse(auth);
};

const handleKhachs = async (event, context, callback) => {
  const authError = await authenticate(event);
  if (authError) {
    return authError;
  }

  const roleError = await verifyRole(event, ["user", "admin"]);
  if (roleError) {
    return roleError;
  }

  try {
    const khachs = await crudControl.functions(event, context, callback);
    return createSuccessResponse(khachs);
  } catch (error) {
    return createErrorResponse(500, error.message);
  }
};

const handleAllUsers = async (event, context, callback) => {
  const authError = await authenticate(event);
  if (authError) {
    return authError;
  }

  const roleError = await verifyRole(event, ["admin"]);
  if (roleError) {
    return roleError;
  }

  try {
    const users = await userControl.functions(event, context, callback);
    return createSuccessResponse(users);
  } catch (error) {
    return createErrorResponse(500, error.message);
  }
};

const handleSingleUser = async (event, context, callback) => {
  const authError = await authenticate(event);
  if (authError) {
    return authError;
  }

  const isAuthorized = await verifyCurrent(event);

  if (!isAuthorized) {
    return createErrorResponse(403, "Not authorized");
  }

  try {
    const user = await userControl.functions(event, context, callback);
    return createSuccessResponse(user);
  } catch (error) {
    return createErrorResponse(500, error.message);
  }
};
