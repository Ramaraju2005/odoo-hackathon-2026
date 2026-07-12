const { PrismaClient } = require("@prisma/client");
const AppError = require("../../shared/errors/AppError");

const prisma = new PrismaClient();

class FuelService {
  async create(data) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    return prisma.fuelLog.create({
      data,
      include: { vehicle: true },
    });
  }

  async getAll(filters = {}) {
    const where = {};

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    return prisma.fuelLog.findMany({
      where,
      include: { vehicle: true },
      orderBy: { date: "desc" },
    });
  }

  async getById(id) {
    const fuelLog = await prisma.fuelLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!fuelLog) {
      throw new AppError("Fuel log not found", 404);
    }

    return fuelLog;
  }

  async update(id, data) {
    const fuelLog = await prisma.fuelLog.findUnique({
      where: { id },
    });

    if (!fuelLog) {
      throw new AppError("Fuel log not found", 404);
    }

    return prisma.fuelLog.update({
      where: { id },
      data,
      include: { vehicle: true },
    });
  }

  async delete(id) {
    const fuelLog = await this.getById(id);

    return prisma.fuelLog.delete({
      where: { id },
    });
  }

  async getFuelConsumption(vehicleId) {
    const logs = await prisma.fuelLog.findMany({
      where: { vehicleId },
    });

    const totalLiters = logs.reduce((sum, log) => sum + log.liters, 0);
    const totalCost = logs.reduce((sum, log) => sum + log.cost, 0);
    const averageCostPerLiter = totalLiters > 0 ? parseFloat((totalCost / totalLiters).toFixed(2)) : 0;

    return {
      vehicleId,
      totalFuelConsumed: totalLiters,
      totalFuelCost: totalCost,
      averageCostPerLiter,
      logCount: logs.length,
      logs,
    };
  }

  async getFuelEfficiency(vehicleId) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const trips = await prisma.trip.findMany({
      where: {
        vehicleId,
        status: "COMPLETED",
      },
    });

    const totalDistance = trips.reduce((sum, trip) => sum + (trip.actualDistance || 0), 0);

    const fuelConsumption = await this.getFuelConsumption(vehicleId);
    const totalLiters = fuelConsumption.totalFuelConsumed;
    const efficiency = totalLiters > 0 ? parseFloat((totalDistance / totalLiters).toFixed(2)) : 0;

    return {
      vehicleId,
      registrationNo: vehicle.registrationNo,
      totalDistance,
      totalFuel: totalLiters,
      fuelEfficiency: efficiency,
      tripCount: trips.length,
    };
  }
}

module.exports = new FuelService();
