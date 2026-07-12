const { PrismaClient } = require("@prisma/client");
const AppError = require("../../shared/errors/AppError");

const prisma = new PrismaClient();

class VehicleService {
  async create(data) {
    const existing = await prisma.vehicle.findUnique({
      where: { registrationNo: data.registrationNo },
    });

    if (existing) {
      throw new AppError("Registration number already exists", 400);
    }

    return prisma.vehicle.create({
      data,
    });
  }

  async getAll(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.type) {
      where.type = filters.type;
    }

    return prisma.vehicle.findMany({
      where,
      include: {
        trips: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });
  }

  async getById(id) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { createdAt: "desc" } },
        maintenanceLogs: { orderBy: { createdAt: "desc" } },
        fuelLogs: { orderBy: { createdAt: "desc" } },
        expenses: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    return vehicle;
  }

  async update(id, data) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    if (data.registrationNo && data.registrationNo !== vehicle.registrationNo) {
      const existing = await prisma.vehicle.findUnique({
        where: { registrationNo: data.registrationNo },
      });
      if (existing) {
        throw new AppError("Registration number already exists", 400);
      }
    }

    return prisma.vehicle.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    return prisma.vehicle.delete({
      where: { id },
    });
  }

  async getAvailableForDispatch() {
    return prisma.vehicle.findMany({
      where: {
        status: {
          in: ["AVAILABLE"],
        },
      },
    });
  }

  async updateStatus(id, status) {
    return prisma.vehicle.update({
      where: { id },
      data: { status },
    });
  }

  async getFuelEfficiency(id) {
    const vehicle = await this.getById(id);
    const trips = await prisma.trip.findMany({
      where: { vehicleId: id, status: "COMPLETED" },
    });

    const totalDistance = trips.reduce((sum, trip) => sum + (trip.actualDistance || 0), 0);
    const totalFuel = await prisma.fuelLog.aggregate({
      where: { vehicleId: id },
      _sum: { liters: true },
    });

    const totalLiters = totalFuel._sum.liters || 0;
    const efficiency = totalLiters > 0 ? totalDistance / totalLiters : 0;

    return {
      vehicleId: id,
      registrationNo: vehicle.registrationNo,
      totalDistance,
      totalFuel: totalLiters,
      fuelEfficiency: parseFloat(efficiency.toFixed(2)),
    };
  }

  async getOperationalCost(id) {
    const maintenance = await prisma.maintenanceLog.aggregate({
      where: { vehicleId: id },
      _sum: { cost: true },
    });

    const fuel = await prisma.fuelLog.aggregate({
      where: { vehicleId: id },
      _sum: { cost: true },
    });

    const expenses = await prisma.expense.aggregate({
      where: { vehicleId: id },
      _sum: { amount: true },
    });

    return {
      maintenanceCost: maintenance._sum.cost || 0,
      fuelCost: fuel._sum.cost || 0,
      otherExpenses: expenses._sum.amount || 0,
      totalCost:
        (maintenance._sum.cost || 0) +
        (fuel._sum.cost || 0) +
        (expenses._sum.amount || 0),
    };
  }
}

module.exports = new VehicleService();
