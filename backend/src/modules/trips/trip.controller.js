const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const tripService = require("./trip.service");

exports.create = catchAsync(async (req, res) => {
  const trip = await tripService.create(req.body);
  ApiResponse.success(res, trip, "Trip created successfully", 201);
});

exports.getAll = catchAsync(async (req, res) => {
  const trips = await tripService.getAll(req.query);
  ApiResponse.success(res, trips, "Trips retrieved successfully");
});

exports.getById = catchAsync(async (req, res) => {
  const trip = await tripService.getById(req.params.id);
  ApiResponse.success(res, trip, "Trip retrieved successfully");
});

exports.update = catchAsync(async (req, res) => {
  const trip = await tripService.update(req.params.id, req.body);
  ApiResponse.success(res, trip, "Trip updated successfully");
});

exports.dispatch = catchAsync(async (req, res) => {
  const trip = await tripService.dispatch(req.params.id);
  ApiResponse.success(res, trip, "Trip dispatched successfully");
});

exports.complete = catchAsync(async (req, res) => {
  const trip = await tripService.complete(req.params.id, req.body);
  ApiResponse.success(res, trip, "Trip completed successfully");
});

exports.cancel = catchAsync(async (req, res) => {
  const trip = await tripService.cancel(req.params.id);
  ApiResponse.success(res, trip, "Trip cancelled successfully");
});

exports.getActiveTrips = catchAsync(async (req, res) => {
  const trips = await tripService.getActiveTrips();
  ApiResponse.success(res, trips, "Active trips retrieved successfully");
});

exports.getPendingTrips = catchAsync(async (req, res) => {
  const trips = await tripService.getPendingTrips();
  ApiResponse.success(res, trips, "Pending trips retrieved successfully");
});
