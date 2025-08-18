const express = require("express");
const validate = require("../middlewares/validate");
const chatSettingsValidation = require("../validations/chatSettings.validation");
const chatSettingsController = require("../controllers/chatSettings.controller");

const router = express.Router();

router
  .route("/")
  .post(validate(chatSettingsValidation.createChatSettings), chatSettingsController.createChatSettings)
  .get(chatSettingsController.getChatSettings)
  .patch(validate(chatSettingsValidation.updateChatSettings), chatSettingsController.updateChatSettings);

router
 
  

module.exports = router;
