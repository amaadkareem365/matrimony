const prisma = require("../utils/db");


const createPackage = async (data) => {
  return prisma.package.create({ data });
};

const getAllPackages = async () => {
  const packages = await prisma.package.findMany({
    select: {
      id: true,
      price: true,
      isActive: true,
      soldCount: true,
    },
  });

  let activePackages = 0;
  let totalSold = 0;
  let totalEarnings = 0;

  for (const pkg of packages) {
    if (pkg.isActive) activePackages++;
    totalSold += pkg.soldCount;
    totalEarnings += pkg.soldCount * pkg.price;
  }

  return {
    packages,
    activePackages,
    totalSold,
    totalEarnings,
  };
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
