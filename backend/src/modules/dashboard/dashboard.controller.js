const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const dashboardService = require("./dashboard.service");

exports.getKPIs = catchAsync(async (req, res) => {
  const kpis = await dashboardService.getKPIs();
  ApiResponse.success(res, kpis, "KPIs retrieved successfully");
});

exports.getFleetStats = catchAsync(async (req, res) => {
  const stats = await dashboardService.getFleetStats();
  ApiResponse.success(res, stats, "Fleet statistics retrieved successfully");
});

exports.getRecentTrips = catchAsync(async (req, res) => {
  const limit = req.query.limit || 10;
  const trips = await dashboardService.getRecentTrips(parseInt(limit));
  ApiResponse.success(res, trips, "Recent trips retrieved successfully");
});

exports.getActivityTimeline = catchAsync(async (req, res) => {
  const limit = req.query.limit || 20;
  const timeline = await dashboardService.getActivitiyTimeline(parseInt(limit));
  ApiResponse.success(res, timeline, "Activity timeline retrieved successfully");
});

exports.getOperationalCosts = catchAsync(async (req, res) => {
  const costs = await dashboardService.getOperationalCosts();
  ApiResponse.success(res, costs, "Operational costs retrieved successfully");
});
