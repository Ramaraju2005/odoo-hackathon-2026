const bcrypt = require("bcrypt");

const AppError = require("../../shared/errors/AppError");

const { generateToken } = require("../../shared/utils/jwt");

const repository = require("./auth.repository");

const register = async (data) => {
  const exists = await repository.findUserByEmail(data.email);

  if (exists) {
    throw new AppError("Email already exists", 409);
  }

  const hashedPassword = await bcrypt.hash(data.password, 10);

  const user = await repository.createUser({
    ...data,
    password: hashedPassword,
  });

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

const login = async ({ email, password }) => {
  const user = await repository.findUserByEmail(email);

  if (!user) {
    throw new AppError("Invalid credentials", 401);
  }

  const match = await bcrypt.compare(password, user.password);

  if (!match) {
    throw new AppError("Invalid credentials", 401);
  }

  const token = generateToken({
    id: user.id,
    role: user.role,
  });

  return {
    token,
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  };
};

module.exports = {
  register,
  login,
};