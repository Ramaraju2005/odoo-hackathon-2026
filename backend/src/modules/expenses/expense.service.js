const { PrismaClient } = require("@prisma/client");
const AppError = require("../../shared/errors/AppError");

const prisma = new PrismaClient();

class ExpenseService {
  async create(data) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    return prisma.expense.create({
      data,
      include: { vehicle: true },
    });
  }

  async getAll(filters = {}) {
    const where = {};

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    return prisma.expense.findMany({
      where,
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });
  }

  async getById(id) {
    const expense = await prisma.expense.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!expense) {
      throw new AppError("Expense not found", 404);
    }

    return expense;
  }

  async update(id, data) {
    const expense = await this.getById(id);

    return prisma.expense.update({
      where: { id },
      data,
      include: { vehicle: true },
    });
  }

  async delete(id) {
    const expense = await this.getById(id);

    return prisma.expense.delete({
      where: { id },
    });
  }

  async getExpensesByVehicle(vehicleId) {
    const expenses = await prisma.expense.findMany({
      where: { vehicleId },
    });

    const totalExpense = expenses.reduce((sum, exp) => sum + exp.amount, 0);
    const byType = {};

    expenses.forEach((exp) => {
      if (!byType[exp.type]) {
        byType[exp.type] = 0;
      }
      byType[exp.type] += exp.amount;
    });

    return {
      vehicleId,
      totalExpense,
      expenseCount: expenses.length,
      byType,
      expenses,
    };
  }

  async getExpensesByType(type) {
    const expenses = await prisma.expense.findMany({
      where: { type },
      include: { vehicle: true },
    });

    const totalAmount = expenses.reduce((sum, exp) => sum + exp.amount, 0);

    return {
      type,
      totalAmount,
      count: expenses.length,
      averageAmount: expenses.length > 0 ? parseFloat((totalAmount / expenses.length).toFixed(2)) : 0,
      expenses,
    };
  }

  async getTotalOperationalCost(vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const maintenance = await prisma.maintenanceLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
    });

    const fuel = await prisma.fuelLog.aggregate({
      where: { vehicleId },
      _sum: { cost: true },
    });

    const expenses = await prisma.expense.aggregate({
      where: { vehicleId },
      _sum: { amount: true },
    });

    const maintenanceCost = maintenance._sum.cost || 0;
    const fuelCost = fuel._sum.cost || 0;
    const expenseAmount = expenses._sum.amount || 0;
    const totalCost = maintenanceCost + fuelCost + expenseAmount;

    const trips = await prisma.trip.findMany({
      where: {
        vehicleId,
        status: "COMPLETED",
      },
    });

    const revenue = trips.length * 1000; // Assuming revenue per trip
    const roi = vehicle.acquisitionCost > 0
      ? parseFloat((((revenue - totalCost) / vehicle.acquisitionCost) * 100).toFixed(2))
      : 0;

    return {
      vehicleId,
      registrationNo: vehicle.registrationNo,
      acquisitionCost: vehicle.acquisitionCost,
      maintenanceCost,
      fuelCost,
      otherExpenses: expenseAmount,
      totalOperationalCost: totalCost,
      estimatedRevenue: revenue,
      roi,
      tripCount: trips.length,
    };
  }
}

module.exports = new ExpenseService();
