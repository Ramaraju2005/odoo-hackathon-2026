const prisma = require("../../config/db");

const findUserByEmail = async (email) => {
  return prisma.user.findUnique({
    where: { email },
  });
};

const createUser = async (data) => {
  return prisma.user.create({
    data,
  });
};

const findUserById = async (id) => {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      isActive: true,
      createdAt: true,
    },
  });
};

module.exports = {
  findUserByEmail,
  createUser,
  findUserById,
};