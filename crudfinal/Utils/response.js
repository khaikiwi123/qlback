const headers = {
  "Access-Control-Allow-Headers": "content-Type, Authorization",
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE",
};

module.exports = {
  createErrorResponse: (statusCode, message, id, inCharge, type) => ({
    statusCode,
    headers,
    body: JSON.stringify({
      error: message,
      id: id,
      incharge: inCharge,
      type: type,
    }),
  }),
  createSuccessResponse: (body) => ({
    statusCode: 200,
    headers,
    body: JSON.stringify(body),
  }),
};
