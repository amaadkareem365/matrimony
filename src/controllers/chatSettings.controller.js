const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const chatSettingsService = require("../services/chatSettings.service");

const createChatSettings = catchAsync(async (req, res) => {
  const settings = await chatSettingsService.createChatSettings(req.body);
  res.status(httpStatus.CREATED).send(settings);
});

const getChatSettings = catchAsync(async (req, res) => {
  const settings = await chatSettingsService.getChatSettings();
  res.send(settings);
});

const updateChatSettings = catchAsync(async (req, res) => {
  const settings = await chatSettingsService.updateChatSettings( req.body);
  res.send(settings);
});

module.exports = {
  createChatSettings,
  getChatSettings,
  updateChatSettings,
};
