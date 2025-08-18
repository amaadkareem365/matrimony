const prisma = require("../utils/db");

const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
const createChatSettings = async (data) => {
  return await prisma.chatSettings.create({ data });
};

const getChatSettings = async (id) => {
  return await prisma.chatSettings.findFirst();
};

const updateChatSettings = async (data) => {
  const setting= await prisma.chatSettings.findFirst();
  return await prisma.chatSettings.update({ where: { id: +setting.id }, data });
};

module.exports = {
  createChatSettings,
  getChatSettings,
  updateChatSettings,
};
