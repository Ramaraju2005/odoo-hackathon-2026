const ApiResponse = require("../shared/utils/ApiResponse");

module.exports = (err, req, res, next) => {
  console.error(err);

  return ApiResponse.error(
    res,
    err.message || "Internal Server a Error",
    err.statusCode || 500
  );
};