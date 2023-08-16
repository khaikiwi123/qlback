const mongoose = require("mongoose");
const {
  handleLogin,
  handleAuth,
  handleLeads,
  handleAllUsers,
  handleSingleUser,
  handleClients,
  handleLeadLog,
} = require("./Utils/handler");
const { createErrorResponse } = require("./Utils/response.js");

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
    case "/auth/logout":
      return handleAuth(event, context, callback);
    case "/auth/login":
      return handleLogin(event, context, callback);
    case "/leads":
    case "/leads/{id}":
      return handleLeads(event, context, callback);
    case "/clients":
    case "/clients/{id}":
      return handleClients(event, context, callback);
    case "/users":
      return handleAllUsers(event, context, callback);
    case "/users/{id}":
      return handleSingleUser(event, context, callback);
    case "/leads/{id}/log":
      return handleLeadLog(event, context, callback);
    default:
      return createErrorResponse(404, "Path not found");
  }
};
