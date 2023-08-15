const Log = require("../models/ChangeLog");
module.exports = {
  getChangeLogForDocument: async (event, collectionName) => {
    try {
      const documentId = event.pathParameters.id;
      const logs = await Log.find({
        documentId,
        sourceCollection: collectionName,
      });
      return { changelog: logs };
    } catch (error) {
      throw new Error(error.message);
    }
  },
};
