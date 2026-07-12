const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const fuelService = require("./fuel.service");

exports.create = catchAsync(async (req, res) => {
  const fuelLog = await fuelService.create(req.body);
  ApiResponse.success(res, fuelLog, "Fuel log created successfully", 201);
});

exports.getAll = catchAsync(async (req, res) => {
  const logs = await fuelService.getAll(req.query);
  ApiResponse.success(res, logs, "Fuel logs retrieved successfully");
});

exports.getById = catchAsync(async (req, res) => {
  const log = await fuelService.getById(req.params.id);
  ApiResponse.success(res, log, "Fuel log retrieved successfully");
});

exports.update = catchAsync(async (req, res) => {
  const log = await fuelService.update(req.params.id, req.body);
  ApiResponse.success(res, log, "Fuel log updated successfully");
});

exports.delete = catchAsync(async (req, res) => {
  await fuelService.delete(req.params.id);
  ApiResponse.success(res, null, "Fuel log deleted successfully");
});

exports.getFuelConsumption = catchAsync(async (req, res) => {
  const consumption = await fuelService.getFuelConsumption(req.params.vehicleId);
  ApiResponse.success(res, consumption, "Fuel consumption retrieved successfully");
});

exports.getFuelEfficiency = catchAsync(async (req, res) => {
  const efficiency = await fuelService.getFuelEfficiency(req.params.vehicleId);
  ApiResponse.success(res, efficiency, "Fuel efficiency retrieved successfully");
});
