const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const maintenanceService = require("./maintenance.service");

exports.create = catchAsync(async (req, res) => {
  const maintenance = await maintenanceService.create(req.body);
  ApiResponse.success(res, maintenance, "Maintenance record created successfully", 201);
});

exports.getAll = catchAsync(async (req, res) => {
  const records = await maintenanceService.getAll(req.query);
  ApiResponse.success(res, records, "Maintenance records retrieved successfully");
});

exports.getById = catchAsync(async (req, res) => {
  const record = await maintenanceService.getById(req.params.id);
  ApiResponse.success(res, record, "Maintenance record retrieved successfully");
});

exports.update = catchAsync(async (req, res) => {
  const record = await maintenanceService.update(req.params.id, req.body);
  ApiResponse.success(res, record, "Maintenance record updated successfully");
});

exports.close = catchAsync(async (req, res) => {
  const record = await maintenanceService.close(req.params.id);
  ApiResponse.success(res, record, "Maintenance record closed successfully");
});

exports.delete = catchAsync(async (req, res) => {
  await maintenanceService.delete(req.params.id);
  ApiResponse.success(res, null, "Maintenance record deleted successfully");
});

exports.getActiveMaintenance = catchAsync(async (req, res) => {
  const records = await maintenanceService.getActiveMaintenance();
  ApiResponse.success(res, records, "Active maintenance records retrieved successfully");
});

exports.getMaintenanceCostByVehicle = catchAsync(async (req, res) => {
  const cost = await maintenanceService.getMaintenanceCostByVehicle(req.params.vehicleId);
  ApiResponse.success(res, cost, "Maintenance cost retrieved successfully");
});
