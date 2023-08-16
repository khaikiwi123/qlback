const service = require("../services/logs");

module.exports = {
  getChangeLog: async (event, collectionName) => {
    return await service.getLog(event, collectionName);
  },
};
