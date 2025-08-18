const prisma = require("../utils/db");

const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

// --- Categories ---
const createCategory = async (data) => {
  return prisma.fAQCategory.create({ data });
};

const getAllCategories = async () => {
  return prisma.fAQCategory.findMany({
    include: { faqs: true },
    orderBy: { name: "asc" },
  });
};

const updateCategory = async (id, data) => {
  return prisma.fAQCategory.update({ where: { id }, data });
};

const deleteCategory = async (id) => {
  await prisma.fAQCategory.delete({ where: { id } });
};

// --- FAQs ---
const createFAQ = async (data) => {
  return prisma.fAQ.create({ data });
};

const getAllFAQs = async () => {
  return prisma.fAQ.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

const updateFAQ = async (id, data) => {
  return prisma.fAQ.update({ where: { id }, data });
};

const deleteFAQ = async (id) => {
  await prisma.fAQ.delete({ where: { id } });
};

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
};
