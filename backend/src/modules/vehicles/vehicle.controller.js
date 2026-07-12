const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const vehicleService = require("./vehicle.service");

exports.create = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.create(req.body);
  ApiResponse.success(res, vehicle, "Vehicle created successfully", 201);
});

exports.getAll = catchAsync(async (req, res) => {
  const vehicles = await vehicleService.getAll(req.query);
  ApiResponse.success(res, vehicles, "Vehicles retrieved successfully");
});

exports.getById = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.getById(req.params.id);
  ApiResponse.success(res, vehicle, "Vehicle retrieved successfully");
});

exports.update = catchAsync(async (req, res) => {
  const vehicle = await vehicleService.update(req.params.id, req.body);
  ApiResponse.success(res, vehicle, "Vehicle updated successfully");
});

exports.delete = catchAsync(async (req, res) => {
  await vehicleService.delete(req.params.id);
  ApiResponse.success(res, null, "Vehicle deleted successfully");
});

exports.getAvailableForDispatch = catchAsync(async (req, res) => {
  const vehicles = await vehicleService.getAvailableForDispatch();
  ApiResponse.success(res, vehicles, "Available vehicles retrieved successfully");
});

exports.getFuelEfficiency = catchAsync(async (req, res) => {
  const efficiency = await vehicleService.getFuelEfficiency(req.params.id);
  ApiResponse.success(res, efficiency, "Fuel efficiency retrieved successfully");
});

exports.getOperationalCost = catchAsync(async (req, res) => {
  const cost = await vehicleService.getOperationalCost(req.params.id);
  ApiResponse.success(res, cost, "Operational cost retrieved successfully");
});
