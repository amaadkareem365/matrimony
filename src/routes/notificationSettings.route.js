const express = require("express");
const {
notificationSettingsController
} = require("../controllers");
const { notificationSettingsValidation } = require("../validations");
const auth = require("../middlewares/auth");
const validate = require("../middlewares/validate");
const router = express.Router();

router.get("/", auth(), notificationSettingsController.getNotificationSettings);
router.patch("/", validate(notificationSettingsValidation.updateNotificationSettingsSchema),auth(), notificationSettingsController.updateNotificationSettings);

module.exports = router;
