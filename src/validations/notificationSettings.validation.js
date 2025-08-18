const Joi = require( 'joi');

 const updateNotificationSettingsSchema = Joi.object({
  // Email Notifications
  emailSecurityAlerts: Joi.boolean(),
  emailAccountUpdates: Joi.boolean(),
  emailNewsletter: Joi.boolean(),

  // Push Notifications
  pushLoginAlerts: Joi.boolean(),
  pushCriticalUpdates: Joi.boolean(),
  pushReminders: Joi.boolean(),

  // System Notifications
  systemTaskUpdates: Joi.boolean(),
  systemComments: Joi.boolean(),
  systemMentions: Joi.boolean(),
}).min(1); // At least one field must be provided

module.exports= {
  updateNotificationSettingsSchema, 
}