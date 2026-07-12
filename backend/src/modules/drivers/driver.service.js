const { PrismaClient } = require("@prisma/client");
const AppError = require("../../shared/errors/AppError");

const prisma = new PrismaClient();

class DriverService {
  async create(data) {
    const existing = await prisma.driver.findUnique({
      where: { licenseNo: data.licenseNo },
    });

    if (existing) {
      throw new AppError("License number already exists", 400);
    }

    return prisma.driver.create({
      data,
    });
    
  }
  async create(data) {
  console.log("Service Data:", data);

  return prisma.driver.create({
    data: {
      ...data,
      licenseExpiryDate: new Date(data.licenseExpiryDate),
      safetyScore: Number(data.safetyScore),
    },
  });
}

  async getAll(filters = {}) {
    const where = {};

    if (filters.status) {
      where.status = filters.status;
    }

    return prisma.driver.findMany({
      where,
      include: {
        trips: { take: 5, orderBy: { createdAt: "desc" } },
      },
    });
  }

  async getById(id) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: { orderBy: { createdAt: "desc" } },
      },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    return driver;
  }

  async update(id, data) {
    const driver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    if (data.licenseNo && data.licenseNo !== driver.licenseNo) {
      const existing = await prisma.driver.findUnique({
        where: { licenseNo: data.licenseNo },
      });
      if (existing) {
        throw new AppError("License number already exists", 400);
      }
    }

    return prisma.driver.update({
      where: { id },
      data,
    });
  }

  async delete(id) {
    const driver = await prisma.driver.findUnique({
      where: { id },
    });

    if (!driver) {
      throw new AppError("Driver not found", 404);
    }

    return prisma.driver.delete({
      where: { id },
    });
  }

  async getAvailableForDispatch() {
    const now = new Date();
    return prisma.driver.findMany({
      where: {
        AND: [
          { status: "AVAILABLE" },
          { licenseExpiryDate: { gt: now } },
        ],
      },
    });
  }

  async updateStatus(id, status) {
    return prisma.driver.update({
      where: { id },
      data: { status },
    });
  }

  async checkLicenseValidity(id) {
    const driver = await this.getById(id);
    const now = new Date();
    const isValid = driver.licenseExpiryDate > now;
    const daysUntilExpiry = Math.ceil((driver.licenseExpiryDate - now) / (1000 * 60 * 60 * 24));

    return {
      driverId: id,
      licenseNo: driver.licenseNo,
      licenseExpiryDate: driver.licenseExpiryDate,
      isValid,
      daysUntilExpiry: isValid ? daysUntilExpiry : 0,
      status: driver.status,
    };
  }

  async getExpiredLicenses() {
    const now = new Date();
    return prisma.driver.findMany({
      where: {
        licenseExpiryDate: { lte: now },
      },
    });
  }

  async getExpiringLicenses(daysThreshold = 30) {
    const now = new Date();
    const thresholdDate = new Date(now.getTime() + daysThreshold * 24 * 60 * 60 * 1000);

    return prisma.driver.findMany({
      where: {
        AND: [
          { licenseExpiryDate: { gt: now } },
          { licenseExpiryDate: { lte: thresholdDate } },
        ],
      },
    });
  }
}

module.exports = new DriverService();
