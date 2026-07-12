const ApiResponse = require("../../shared/utils/ApiResponse");
const catchAsync = require("../../shared/utils/catchAsync");
const expenseService = require("./expense.service");

exports.create = catchAsync(async (req, res) => {
  const expense = await expenseService.create(req.body);
  ApiResponse.success(res, expense, "Expense created successfully", 201);
});

exports.getAll = catchAsync(async (req, res) => {
  const expenses = await expenseService.getAll(req.query);
  ApiResponse.success(res, expenses, "Expenses retrieved successfully");
});

exports.getById = catchAsync(async (req, res) => {
  const expense = await expenseService.getById(req.params.id);
  ApiResponse.success(res, expense, "Expense retrieved successfully");
});

exports.update = catchAsync(async (req, res) => {
  const expense = await expenseService.update(req.params.id, req.body);
  ApiResponse.success(res, expense, "Expense updated successfully");
});

exports.delete = catchAsync(async (req, res) => {
  await expenseService.delete(req.params.id);
  ApiResponse.success(res, null, "Expense deleted successfully");
});

exports.getExpensesByVehicle = catchAsync(async (req, res) => {
  const expenses = await expenseService.getExpensesByVehicle(req.params.vehicleId);
  ApiResponse.success(res, expenses, "Vehicle expenses retrieved successfully");
});

exports.getExpensesByType = catchAsync(async (req, res) => {
  const expenses = await expenseService.getExpensesByType(req.params.type);
  ApiResponse.success(res, expenses, "Expenses by type retrieved successfully");
});

exports.getTotalOperationalCost = catchAsync(async (req, res) => {
  const cost = await expenseService.getTotalOperationalCost(req.params.vehicleId);
  ApiResponse.success(res, cost, "Total operational cost retrieved successfully");
});
