const prisma = require("../utils/db");

const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

const create = async (data) => {
  const exists = await prisma.profileAttribute.findUnique({ where: { key: data.key } });
  if (exists) throw new ApiError(httpStatus.BAD_REQUEST, "Attribute already exists");
  return prisma.profileAttribute.create({ data });
};

const getAll = async () => {
  return prisma.profileAttribute.findMany({ orderBy: { order: "asc" } });
};

const getById = async (id) => {
  const attribute = await prisma.profileAttribute.findUnique({ where: { id } });
  if (!attribute) throw new ApiError(httpStatus.NOT_FOUND, "Attribute not found");
  return attribute;
};

const update = async (id, data) => {
  return prisma.profileAttribute.update({ where: { id }, data });
};

const remove = async (id) => {
  await prisma.profileAttribute.delete({ where: { id } });
};

const addOption = async (id, option) => {
  const attr = await getById(id);
  const existingOptions = attr.options?.split(",").map((o) => o.trim()) || [];
  if (existingOptions.includes(option)) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Option already exists");
  }
  existingOptions.push(option);
  return prisma.profileAttribute.update({
    where: { id },
    data: { options: existingOptions.join(",") },
  });
};

const getByKey = async (key) => {
  const attribute = await prisma.profileAttribute.findUnique({ where: { key } });
  if (!attribute) throw new ApiError(httpStatus.NOT_FOUND, "Attribute not found");
  return attribute;
};

const removeOption = async (id, optionToRemove) => {
  const attr = await getById(id);
  const existingOptions = attr.options?.split(",").map((o) => o.trim()) || [];
  const filtered = existingOptions.filter((opt) => opt !== optionToRemove);
  return prisma.profileAttribute.update({
    where: { id },
    data: { options: filtered.join(",") },
  });
};

module.exports = {
  create,
  getAll,
  getById,
  update,
  remove,
  addOption,
  removeOption,
  getByKey,
};
