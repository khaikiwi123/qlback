const mongoose = require("mongoose");
const crudControl = require("./controllers/crud.js");
const authControl = require("./controllers/auth.js");
const userControl = require("./controllers/user.js");
const { verifyToken, verifyRole } = require("./Utils/auth.js");

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
    case "/users/{id}":
      return handleUsers(event, context, callback);
    default:
      return createErrorResponse(404, "Path not found");
  }
};

const createErrorResponse = (statusCode, message) => ({
  statusCode,
  headers: headers,
  body: JSON.stringify({ error: message }),
});

const createSuccessResponse = (body) => ({
  statusCode: 200,
  headers: headers,
  body: JSON.stringify(body),
});

const headers = {
  "Access-Control-Allow-Headers": "content-Type, Authorization",
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
};

const authenticate = async (event) => {
  const tokenVerify = await verifyToken(event);
  if (!tokenVerify || tokenVerify === "expired") {
    let message =
      tokenVerify === "expired" ? "Token expired" : "Authentication error";
    return createErrorResponse(401, message);
  }
  return null;
};

const handleLogin = async (event, context, callback) => {
  const auth = await authControl.functions(event, context, callback);
  if (auth === "User's not found" || auth === "Invalid Password") {
    return createSuccessResponse(auth);
  }
  const refresh = auth.refresh;
  const access = auth.access;
  return createSuccessResponse({ access: access, refresh: refresh });
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
  const role = await verifyRole(event);
  if (role !== "user" && role !== "admin") {
    return createErrorResponse(403, "Not authorized");
  }
  try {
    const khachs = await crudControl.functions(event, context, callback);
    return createSuccessResponse(khachs);
  } catch (error) {
    return createErrorResponse(500, error.message);
  }
};

const handleUsers = async (event, context, callback) => {
  const authError = await authenticate(event);
  if (authError) {
    return authError;
  }
  const role = await verifyRole(event);
  if (role !== "admin") {
    return createErrorResponse(403, "Not admin authorized");
  }
  try {
    const users = await userControl.functions(event, context, callback);
    return createSuccessResponse(users);
  } catch (error) {
    return createErrorResponse(500, err.message);
  }
};
