const { PrismaClient } = require("@prisma/client");
const AppError = require("../../shared/errors/AppError");

const prisma = new PrismaClient();

class MaintenanceService {
  async create(data) {
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    const maintenance = await prisma.maintenanceLog.create({
      data,
    });

    // Update vehicle status to IN_SHOP
    await prisma.vehicle.update({
      where: { id: data.vehicleId },
      data: { status: "IN_SHOP" },
    });

    return maintenance;
  }

  async getAll(filters = {}) {
    const where = {};

    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }

    return prisma.maintenanceLog.findMany({
      where,
      include: { vehicle: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id) {
    const maintenance = await prisma.maintenanceLog.findUnique({
      where: { id },
      include: { vehicle: true },
    });

    if (!maintenance) {
      throw new AppError("Maintenance record not found", 404);
    }

    return maintenance;
  }

  async update(id, data) {
    const maintenance = await prisma.maintenanceLog.findUnique({
      where: { id },
    });

    if (!maintenance) {
      throw new AppError("Maintenance record not found", 404);
    }

    return prisma.maintenanceLog.update({
      where: { id },
      data,
      include: { vehicle: true },
    });
  }

  async close(id) {
    const maintenance = await this.getById(id);

    if (maintenance.endDate) {
      throw new AppError("Maintenance record is already closed", 400);
    }

    const updated = await prisma.maintenanceLog.update({
      where: { id },
      data: { endDate: new Date() },
      include: { vehicle: true },
    });

    // Check if there are other active maintenance records
    const otherMaintenance = await prisma.maintenanceLog.findMany({
      where: {
        vehicleId: maintenance.vehicleId,
        endDate: null,
        id: { not: id },
      },
    });

    // If no other active maintenance and vehicle is not retired, restore to AVAILABLE
    if (otherMaintenance.length === 0 && maintenance.vehicle.status !== "RETIRED") {
      await prisma.vehicle.update({
        where: { id: maintenance.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    return updated;
  }

  async delete(id) {
    const maintenance = await this.getById(id);

    return prisma.maintenanceLog.delete({
      where: { id },
    });
  }

  async getActiveMaintenance() {
    return prisma.maintenanceLog.findMany({
      where: {
        endDate: null,
      },
      include: { vehicle: true },
      orderBy: { startDate: "asc" },
    });
  }

  async getMaintenanceCostByVehicle(vehicleId) {
    const records = await prisma.maintenanceLog.findMany({
      where: { vehicleId },
    });

    const totalCost = records.reduce((sum, record) => sum + record.cost, 0);
    const count = records.length;

    return {
      vehicleId,
      totalMaintenanceCost: totalCost,
      maintenanceCount: count,
      averageCost: count > 0 ? parseFloat((totalCost / count).toFixed(2)) : 0,
      records,
    };
  }
}

module.exports = new MaintenanceService();
