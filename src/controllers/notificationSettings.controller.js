const notificationSettingsService = require('../services/notificationSettings.service.js');

 const getNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id; // Assuming auth middleware attaches user object
    const settings = await notificationSettingsService.getSettingsByUserId(userId);

    if (!settings) {
      return res.status(404).json({ message: 'Notification settings not found' });
    }

    res.status(200).json(settings);
  } catch (error) {
    console.error('Error getting notification settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

 const updateNotificationSettings = async (req, res) => {
  try {
    const userId = req.user.id;
    const updates = req.body;

    const updated = await notificationSettingsService.updateSettings(userId, updates);

    res.status(200).json({
      message: 'Notification settings updated successfully',
      settings: updated,
    });
  } catch (error) {
    console.error('Error updating notification settings:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = {
    getNotificationSettings,
    updateNotificationSettings,
};