const mongoose = require("mongoose");
const {
  handleLogin,
  handleAuth,
  handleLeads,
  handleAllUsers,
  handleProducts,
  handleSingleUser,
  handleCustomers,
  handleLeadLog,
  handleBill,
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
    case "/customers":
    case "/customers/{id}":
      return handleCustomers(event, context, callback);
    case "/users":
      return handleAllUsers(event, context, callback);
    case "/users/{id}":
      return handleSingleUser(event, context, callback);
    case "/leads/{id}/log":
      return handleLeadLog(event, context, callback);
    case "/bills":
    case "/bills/{id}":
      return handleBill(event, context, callback);
    case "/products":
    case "/products/{id}":
      return handleProducts(event, context, callback);
    default:
      return createErrorResponse(404, "Path not found");
  }
};
