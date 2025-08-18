const prisma = require("../utils/db");


const createBanner = async (data) => {
  return await prisma.banner.create({ data });
};

const getAllBanners = async () => {
  return await prisma.banner.findMany({ orderBy: { createdAt: "desc" } });
};

const getBanner = async (id) => {
  return await prisma.banner.findUnique({ where: { id: +id } });
};

const updateBanner = async (id, data) => {
  return await prisma.banner.update({ where: { id: +id }, data });
};

const deleteBanner = async (id) => {
  return await prisma.banner.delete({ where: { id: +id } });
};

module.exports = {
  createBanner,
  getAllBanners,
  getBanner,
  updateBanner,
  deleteBanner,
};
