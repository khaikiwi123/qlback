const service = require("../services/logs");

module.exports = {
  getChangeLog: async (event, collectionName) => {
    return await service.getChangeLogForDocument(event, collectionName);
  },
};
