const { PrismaClient } = require("@prisma/client");
const AppError = require("../../shared/errors/AppError");

const prisma = new PrismaClient();

class TripService {
  async create(data) {
    // Validate vehicle availability
    const vehicle = await prisma.vehicle.findUnique({
      where: { id: data.vehicleId },
    });

    if (!vehicle) {
      throw new AppError("Vehicle not found", 404);
    }

    if (vehicle.status !== "AVAILABLE") {
      throw new AppError("Vehicle is not available for dispatch", 400);
    }

    // Validate driver availability and license
    const driver = await prisma.driver.findUnique({
      where: { id: data.driverId },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    if (driver.status === "SUSPENDED") {
      throw new AppError("Driver is suspended and cannot be assigned", 400);
    }

    if (driver.status !== "AVAILABLE") {
      throw new AppError("Driver is not available for dispatch", 400);
    }

    const now = new Date();
    if (driver.licenseExpiryDate <= now) {
      throw new AppError("Driver's license has expired", 400);
    }

    // Validate cargo weight
    if (data.cargoWeight > vehicle.maxLoadCapacity) {
      throw new AppError(
        `Cargo weight (${data.cargoWeight}kg) exceeds vehicle capacity (${vehicle.maxLoadCapacity}kg)`,
        400
      );
    }

    return prisma.trip.create({
      data,
      include: { vehicle: true, driver: true },
    });
  }

  async getAll(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.vehicleId) {
      where.vehicleId = filters.vehicleId;
    }
    if (filters.driverId) {
      where.driverId = filters.driverId;
    }

    return prisma.trip.findMany({
      where,
      include: { vehicle: true, driver: true },
      orderBy: { createdAt: "desc" },
    });
  }

  async getById(id) {
    const trip = await prisma.trip.findUnique({
      where: { id },
      include: { vehicle: true, driver: true },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    return trip;
  }

  async update(id, data) {
    const trip = await prisma.trip.findUnique({
      where: { id },
    });

    if (!trip) {
      throw new AppError("Trip not found", 404);
    }

    return prisma.trip.update({
      where: { id },
      data,
      include: { vehicle: true, driver: true },
    });
  }

  async dispatch(id) {
    const trip = await this.getById(id);

    if (trip.status !== "DRAFT") {
      throw new AppError("Only draft trips can be dispatched", 400);
    }

    // Update trip status
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { status: "DISPATCHED" },
      include: { vehicle: true, driver: true },
    });

    // Update vehicle and driver status
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "ON_TRIP" },
    });

    await prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: "ON_TRIP" },
    });

    return updatedTrip;
  }

  async complete(id, data) {
    const trip = await this.getById(id);

    if (trip.status !== "DISPATCHED") {
      throw new AppError("Only dispatched trips can be completed", 400);
    }

    // Update trip status
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: {
        status: "COMPLETED",
        actualDistance: data.actualDistance,
        fuelConsumed: data.fuelConsumed,
        completedAt: new Date(),
      },
      include: { vehicle: true, driver: true },
    });

    // Update vehicle and driver status back to AVAILABLE
    await prisma.vehicle.update({
      where: { id: trip.vehicleId },
      data: { status: "AVAILABLE", odometer: data.actualDistance },
    });

    await prisma.driver.update({
      where: { id: trip.driverId },
      data: { status: "AVAILABLE" },
    });

    return updatedTrip;
  }

  async cancel(id) {
    const trip = await this.getById(id);

    if (!["DRAFT", "DISPATCHED"].includes(trip.status)) {
      throw new AppError("Only draft or dispatched trips can be cancelled", 400);
    }

    // Update trip status
    const updatedTrip = await prisma.trip.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: { vehicle: true, driver: true },
    });

    // Restore vehicle and driver to AVAILABLE (only if status is ON_TRIP)
    if (trip.vehicle.status === "ON_TRIP") {
      await prisma.vehicle.update({
        where: { id: trip.vehicleId },
        data: { status: "AVAILABLE" },
      });
    }

    if (trip.driver.status === "ON_TRIP") {
      await prisma.driver.update({
        where: { id: trip.driverId },
        data: { status: "AVAILABLE" },
      });
    }

    return updatedTrip;
  }

  async getActiveTrips() {
    return prisma.trip.findMany({
      where: {
        status: {
          in: ["DISPATCHED"],
        },
      },
      include: { vehicle: true, driver: true },
    });
  }

  async getPendingTrips() {
    return prisma.trip.findMany({
      where: {
        status: {
          in: ["DRAFT"],
        },
      },
      include: { vehicle: true, driver: true },
    });
  }
}

module.exports = new TripService();
