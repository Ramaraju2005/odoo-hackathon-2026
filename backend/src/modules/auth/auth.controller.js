const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");

const {
  registerSchema,
  loginSchema,
} = require("./auth.validation");

const service = require("./auth.service");

exports.register = catchAsync(async (req, res) => {
  const data = registerSchema.parse(req.body);

  const result = await service.register(data);

  ApiResponse.success(
    res,
    result,
    "User registered successfully",
    201
  );
});

exports.login = catchAsync(async (req, res) => {
  const data = loginSchema.parse(req.body);

  const result = await service.login(data);

  ApiResponse.success(res, result, "Login successful");
});