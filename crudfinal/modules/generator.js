module.exports = {
  getDocuments: async (Model, event, parameters) => {
    let query = {};
    const { pageNumber, pageSize, ...fields } =
      event.queryStringParameters || {};

    for (let key of parameters) {
      if (fields[key]) {
        if (
          fields[key].toLowerCase() === "true" ||
          fields[key].toLowerCase() === "false"
        ) {
          query = {
            ...query,
            [key]: fields[key].toLowerCase() === "true",
          };
        } else {
          query = {
            ...query,
            [key]: new RegExp(fields[key], "i"),
          };
        }
      }
    }

    const total = await Model.countDocuments(query);

    let modelQuery = Model.find(query);

    if (pageNumber && pageSize) {
      modelQuery = modelQuery
        .skip((parseInt(pageNumber) - 1) * parseInt(pageSize))
        .limit(parseInt(pageSize));
    }

    const documents = await modelQuery;

    return { documents, total };
  },
};
