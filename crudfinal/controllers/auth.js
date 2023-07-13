const services = require("../services/auths");

module.exports = {
  functions: async (event, context, callback) => {
    switch (event.resource) {
      case "/auth/register":
        return await services.register(event);
      case "/auth/login":
        return services.login(event);
      case "/auth/logout":
        return services.logout(event);
      case "/auth/refresh":
        return services.refresh(event);
      default:
        return {
          statusCode: 404,
          body: "Path not found after auth/",
        };
    }
  },
};
