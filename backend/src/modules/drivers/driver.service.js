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
      data: {
        name: data.name,
        licenseNo: data.licenseNo,
        licenseCategory: data.licenseCategory,
        licenseExpiryDate: new Date(data.licenseExpiryDate),
        contactNumber: data.contactNumber,
        safetyScore: Number(data.safetyScore),
        status: data.status || "AVAILABLE",
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
        trips: {
          take: 5,
          orderBy: {
            createdAt: "desc",
          },
        },
      },
    });
  }

  async getById(id) {
    const driver = await prisma.driver.findUnique({
      where: { id },
      include: {
        trips: {
          orderBy: {
            createdAt: "desc",
          },
        },
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
        where: {
          licenseNo: data.licenseNo,
        },
      });

      if (existing) {
        throw new AppError("License number already exists", 400);
      }
    }

    const updateData = {};

    if (data.name !== undefined) updateData.name = data.name;
    if (data.licenseNo !== undefined) updateData.licenseNo = data.licenseNo;
    if (data.licenseCategory !== undefined)
      updateData.licenseCategory = data.licenseCategory;

    if (data.licenseExpiryDate !== undefined) {
      updateData.licenseExpiryDate = new Date(data.licenseExpiryDate);
    }

    if (data.contactNumber !== undefined)
      updateData.contactNumber = data.contactNumber;

    if (data.safetyScore !== undefined) {
      updateData.safetyScore = Number(data.safetyScore);
    }

    if (data.status !== undefined) {
      updateData.status = data.status;
    }

    return prisma.driver.update({
      where: { id },
      data: updateData,
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
        status: "AVAILABLE",
        licenseExpiryDate: {
          gt: now,
        },
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
    const daysUntilExpiry = Math.ceil(
      (driver.licenseExpiryDate - now) / (1000 * 60 * 60 * 24)
    );

    return {
      driverId: driver.id,
      licenseNo: driver.licenseNo,
      licenseExpiryDate: driver.licenseExpiryDate,
      isValid,
      daysUntilExpiry: isValid ? daysUntilExpiry : 0,
      status: driver.status,
    };
  }

  async getExpiredLicenses() {
    return prisma.driver.findMany({
      where: {
        licenseExpiryDate: {
          lte: new Date(),
        },
      },
    });
  }

  async getExpiringLicenses(daysThreshold = 30) {
    const now = new Date();
    const thresholdDate = new Date(
      now.getTime() + daysThreshold * 24 * 60 * 60 * 1000
    );

    return prisma.driver.findMany({
      where: {
        licenseExpiryDate: {
          gt: now,
          lte: thresholdDate,
        },
      },
    });
  }
}

module.exports = new DriverService();