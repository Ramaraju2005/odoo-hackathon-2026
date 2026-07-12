const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const reportService = require("./report.service");

exports.getFuelEfficiencyReport = catchAsync(async (req, res) => {
  const report = await reportService.getFuelEfficiencyReport();
  ApiResponse.success(res, report, "Fuel efficiency report generated successfully");
});

exports.getFleetUtilizationReport = catchAsync(async (req, res) => {
  const report = await reportService.getFleetUtilizationReport();
  ApiResponse.success(res, report, "Fleet utilization report generated successfully");
});

exports.getOperationalCostReport = catchAsync(async (req, res) => {
  const report = await reportService.getOperationalCostReport();
  ApiResponse.success(res, report, "Operational cost report generated successfully");
});

exports.getVehicleROIReport = catchAsync(async (req, res) => {
  const report = await reportService.getVehicleROIReport();
  ApiResponse.success(res, report, "Vehicle ROI report generated successfully");
});

exports.getTripsReport = catchAsync(async (req, res) => {
  const report = await reportService.getTripsReport(req.query);
  ApiResponse.success(res, report, "Trips report generated successfully");
});

exports.getMaintenanceReport = catchAsync(async (req, res) => {
  const report = await reportService.getMaintenanceReport();
  ApiResponse.success(res, report, "Maintenance report generated successfully");
});

exports.exportToCSV = catchAsync(async (req, res) => {
  const { reportType } = req.params;
  const { filename, content } = await reportService.exportToCSV(reportType);

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
  res.send(content);
});
