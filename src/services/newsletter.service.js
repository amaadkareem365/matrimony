const prisma = require("../utils/db");



const createNewsletter = async (data) => {
  return await prisma.newsletter.create({ data });
};

const getAllNewsletters = async () => {
  return await prisma.newsletter.findMany({ orderBy: { createdAt: "desc" } });
};

const getNewsletter = async (id) => {
  return await prisma.newsletter.findUnique({ where: { id: +id } });
};

const deleteNewsletter = async (id) => {
  return await prisma.newsletter.delete({ where: { id: +id } });
};

module.exports = {
  createNewsletter,
  getAllNewsletters,
  getNewsletter,
  deleteNewsletter,
};