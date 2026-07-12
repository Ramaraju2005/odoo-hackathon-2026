const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const driverService = require("./driver.service");

exports.create = catchAsync(async (req, res) => {
  const driver = await driverService.create(req.body);
  ApiResponse.success(res, driver, "Driver created successfully", 201);
});

exports.getAll = catchAsync(async (req, res) => {
  const drivers = await driverService.getAll(req.query);
  ApiResponse.success(res, drivers, "Drivers retrieved successfully");
});

exports.getById = catchAsync(async (req, res) => {
  const driver = await driverService.getById(req.params.id);
  ApiResponse.success(res, driver, "Driver retrieved successfully");
});

exports.update = catchAsync(async (req, res) => {
  const driver = await driverService.update(req.params.id, req.body);
  ApiResponse.success(res, driver, "Driver updated successfully");
});

exports.delete = catchAsync(async (req, res) => {
  await driverService.delete(req.params.id);
  ApiResponse.success(res, null, "Driver deleted successfully");
});

exports.getAvailableForDispatch = catchAsync(async (req, res) => {
  const drivers = await driverService.getAvailableForDispatch();
  ApiResponse.success(res, drivers, "Available drivers retrieved successfully");
});

exports.checkLicenseValidity = catchAsync(async (req, res) => {
  const validity = await driverService.checkLicenseValidity(req.params.id);
  ApiResponse.success(res, validity, "License validity checked successfully");
});

exports.getExpiredLicenses = catchAsync(async (req, res) => {
  const drivers = await driverService.getExpiredLicenses();
  ApiResponse.success(res, drivers, "Expired licenses retrieved successfully");
});

exports.getExpiringLicenses = catchAsync(async (req, res) => {
  const days = req.query.days || 30;
  const drivers = await driverService.getExpiringLicenses(parseInt(days));
  ApiResponse.success(res, drivers, "Expiring licenses retrieved successfully");
});
