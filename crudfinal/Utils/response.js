const headers = {
  "Access-Control-Allow-Headers": "content-Type, Authorization",
  "Access-Control-Allow-Origin": "http://localhost:3000",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
};

module.exports = {
  createErrorResponse: (statusCode, message, id, inCharge) => ({
    statusCode,
    headers,
    body: JSON.stringify({ error: message, clientId: id, incharge: inCharge }),
  }),
  createSuccessResponse: (body) => ({
    statusCode: 200,
    headers,
    body: JSON.stringify(body),
  }),
};
