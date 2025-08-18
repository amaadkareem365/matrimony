const prisma = require("../utils/db");


const createPackage = async (data) => {
  return prisma.package.create({ data });
};

const getAllPackages = async () => {
  return prisma.package.findMany({
    orderBy: { createdAt: "desc" },
  });
};

const getPackageById = async (id) => {
  return prisma.package.findUnique({ where: { id } });
};

const updatePackage = async (id, data) => {
  return prisma.package.update({ where: { id }, data });
};

const deletePackage = async (id) => {
  return prisma.package.delete({ where: { id } });
};

module.exports = {
  createPackage,
  getAllPackages,
  getPackageById,
  updatePackage,
  deletePackage,
};
