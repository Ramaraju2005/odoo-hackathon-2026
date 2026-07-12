const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();

class ReportsService {
  async getFuelEfficiencyReport() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: {
          where: { status: "COMPLETED" },
        },
        fuelLogs: true,
      },
    });

    const report = vehicles.map((vehicle) => {
      const totalDistance = vehicle.trips.reduce(
        (sum, trip) => sum + (trip.actualDistance || 0),
        0
      );
      const totalFuel = vehicle.fuelLogs.reduce((sum, log) => sum + log.liters, 0);
      const efficiency = totalFuel > 0 ? parseFloat((totalDistance / totalFuel).toFixed(2)) : 0;

      return {
        vehicleId: vehicle.id,
        registrationNo: vehicle.registrationNo,
        name: vehicle.name,
        totalTrips: vehicle.trips.length,
        totalDistance,
        totalFuel,
        fuelEfficiency: efficiency,
      };
    });

    return {
      type: "Fuel Efficiency Report",
      generatedAt: new Date(),
      data: report,
      summary: {
        bestPerformer: report.length > 0 ? report.reduce((max, v) => v.fuelEfficiency > max.fuelEfficiency ? v : max) : null,
        averageEfficiency: report.length > 0 ? parseFloat((report.reduce((sum, v) => sum + v.fuelEfficiency, 0) / report.length).toFixed(2)) : 0,
      },
    };
  }

  async getFleetUtilizationReport() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        trips: {
          where: { status: "COMPLETED" },
        },
      },
    });

    const totalVehicles = vehicles.length;
    const activeVehicles = vehicles.filter((v) => v.status === "ON_TRIP").length;
    const utilizationPercentage = totalVehicles > 0 ? parseFloat(((activeVehicles / totalVehicles) * 100).toFixed(2)) : 0;

    const vehicleUtilization = vehicles.map((vehicle) => ({
      vehicleId: vehicle.id,
      registrationNo: vehicle.registrationNo,
      name: vehicle.name,
      status: vehicle.status,
      tripsCompleted: vehicle.trips.length,
      utilizationPercentage: totalVehicles > 0 ? parseFloat(((vehicle.trips.length / totalVehicles) * 100).toFixed(2)) : 0,
    }));

    return {
      type: "Fleet Utilization Report",
      generatedAt: new Date(),
      data: vehicleUtilization,
      summary: {
        totalVehicles,
        activeVehicles,
        overallUtilization: utilizationPercentage,
      },
    };
  }

  async getOperationalCostReport() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: true,
        maintenanceLogs: true,
        expenses: true,
        trips: {
          where: { status: "COMPLETED" },
        },
      },
    });

    const report = vehicles.map((vehicle) => {
      const fuelCost = vehicle.fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const maintenanceCost = vehicle.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
      const expenseCost = vehicle.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalCost = fuelCost + maintenanceCost + expenseCost;

      return {
        vehicleId: vehicle.id,
        registrationNo: vehicle.registrationNo,
        name: vehicle.name,
        fuelCost,
        maintenanceCost,
        otherExpenses: expenseCost,
        totalCost,
        costPerTrip: vehicle.trips.length > 0 ? parseFloat((totalCost / vehicle.trips.length).toFixed(2)) : 0,
      };
    });

    const totalFuelCost = report.reduce((sum, v) => sum + v.fuelCost, 0);
    const totalMaintenanceCost = report.reduce((sum, v) => sum + v.maintenanceCost, 0);
    const totalExpenseCost = report.reduce((sum, v) => sum + v.otherExpenses, 0);
    const grandTotal = totalFuelCost + totalMaintenanceCost + totalExpenseCost;

    return {
      type: "Operational Cost Report",
      generatedAt: new Date(),
      data: report,
      summary: {
        totalFuelCost,
        totalMaintenanceCost,
        totalExpenses: totalExpenseCost,
        grandTotal,
        averageCostPerTrip: report.length > 0 ? parseFloat((report.reduce((sum, v) => sum + v.costPerTrip, 0) / report.length).toFixed(2)) : 0,
      },
    };
  }

  async getVehicleROIReport() {
    const vehicles = await prisma.vehicle.findMany({
      include: {
        fuelLogs: true,
        maintenanceLogs: true,
        expenses: true,
        trips: {
          where: { status: "COMPLETED" },
        },
      },
    });

    const report = vehicles.map((vehicle) => {
      const fuelCost = vehicle.fuelLogs.reduce((sum, log) => sum + log.cost, 0);
      const maintenanceCost = vehicle.maintenanceLogs.reduce((sum, log) => sum + log.cost, 0);
      const expenseCost = vehicle.expenses.reduce((sum, exp) => sum + exp.amount, 0);
      const totalCost = fuelCost + maintenanceCost + expenseCost;
      const revenue = vehicle.trips.length * 1000;

      const roi = vehicle.acquisitionCost > 0
        ? parseFloat((((revenue - totalCost) / vehicle.acquisitionCost) * 100).toFixed(2))
        : 0;

      return {
        vehicleId: vehicle.id,
        registrationNo: vehicle.registrationNo,
        name: vehicle.name,
        acquisitionCost: vehicle.acquisitionCost,
        totalOperationalCost: totalCost,
        estimatedRevenue: revenue,
        roi,
        breakEvenTrips: vehicle.acquisitionCost > 0 ? Math.ceil(vehicle.acquisitionCost / (1000 - (totalCost / (vehicle.trips.length || 1)))) : 0,
      };
    });

    const bestROI = report.length > 0 ? report.reduce((max, v) => v.roi > max.roi ? v : max) : null;
    const averageROI = report.length > 0 ? parseFloat((report.reduce((sum, v) => sum + v.roi, 0) / report.length).toFixed(2)) : 0;

    return {
      type: "Vehicle ROI Report",
      generatedAt: new Date(),
      data: report,
      summary: {
        bestPerformer: bestROI,
        averageROI,
      },
    };
  }

  async getTripsReport(filters = {}) {
    const where = {};
    if (filters.status) {
      where.status = filters.status;
    }

    const trips = await prisma.trip.findMany({
      where,
      include: {
        vehicle: true,
        driver: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const report = trips.map((trip) => ({
      tripId: trip.id,
      vehicle: trip.vehicle.registrationNo,
      driver: trip.driver.name,
      source: trip.source,
      destination: trip.destination,
      cargoWeight: trip.cargoWeight,
      plannedDistance: trip.plannedDistance,
      actualDistance: trip.actualDistance,
      fuelConsumed: trip.fuelConsumed,
      status: trip.status,
      completedAt: trip.completedAt,
    }));

    return {
      type: "Trips Report",
      generatedAt: new Date(),
      filters,
      data: report,
      summary: {
        totalTrips: trips.length,
        completedTrips: trips.filter((t) => t.status === "COMPLETED").length,
        totalDistance: trips.reduce((sum, t) => sum + (t.actualDistance || t.plannedDistance || 0), 0),
      },
    };
  }

  async getMaintenanceReport() {
    const maintenanceLogs = await prisma.maintenanceLog.findMany({
      include: {
        vehicle: true,
      },
      orderBy: { createdAt: "desc" },
    });

    const report = maintenanceLogs.map((log) => ({
      maintenanceId: log.id,
      vehicle: log.vehicle.registrationNo,
      description: log.description,
      cost: log.cost,
      startDate: log.startDate,
      endDate: log.endDate,
      duration: log.endDate ? Math.ceil((log.endDate - log.startDate) / (1000 * 60 * 60 * 24)) : null,
    }));

    const activeMaintenance = maintenanceLogs.filter((m) => !m.endDate);
    const totalCost = maintenanceLogs.reduce((sum, m) => sum + m.cost, 0);

    return {
      type: "Maintenance Report",
      generatedAt: new Date(),
      data: report,
      summary: {
        totalRecords: maintenanceLogs.length,
        activeMaintenance: activeMaintenance.length,
        completedMaintenance: maintenanceLogs.filter((m) => m.endDate).length,
        totalMaintenanceCost: totalCost,
        averageCost: maintenanceLogs.length > 0 ? parseFloat((totalCost / maintenanceLogs.length).toFixed(2)) : 0,
      },
    };
  }

  async exportToCSV(reportType) {
    let reportData;

    switch (reportType) {
      case "fuel-efficiency":
        reportData = await this.getFuelEfficiencyReport();
        break;
      case "fleet-utilization":
        reportData = await this.getFleetUtilizationReport();
        break;
      case "operational-cost":
        reportData = await this.getOperationalCostReport();
        break;
      case "vehicle-roi":
        reportData = await this.getVehicleROIReport();
        break;
      case "trips":
        reportData = await this.getTripsReport();
        break;
      case "maintenance":
        reportData = await this.getMaintenanceReport();
        break;
      default:
        throw new Error("Unknown report type");
    }

    // Convert to CSV format
    const headers = Object.keys(reportData.data[0] || {});
    const csv = [
      headers.join(","),
      ...reportData.data.map((row) =>
        headers.map((header) => {
          const value = row[header];
          return typeof value === "string" ? `"${value}"` : value;
        }).join(",")
      ),
    ].join("\n");

    return {
      filename: `${reportType}-${Date.now()}.csv`,
      content: csv,
    };
  }
}

module.exports = new ReportsService();
