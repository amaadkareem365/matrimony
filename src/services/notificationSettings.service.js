const prisma = require("../utils/db");


// Get notification settings by user ID
const getSettingsByUserId = async (userId) => {
  return await prisma.notificationSettings.findUnique({
    where: { userId },
  });
};

// Update multiple notification settings
const updateSettings = async (userId, updates) => {
  return await prisma.notificationSettings.update({
    where: { userId },
    data: updates,
  });
};

// Initialize settings for new users (optional, call on registration)
const createDefaultSettings = async (userId) => {
  return await prisma.notificationSettings.create({
    data: {
      userId,
      // Optionally set some to true if needed
    },
  });
};

module.exports = {
  createDefaultSettings,
  updateSettings,
  getSettingsByUserId,
};
