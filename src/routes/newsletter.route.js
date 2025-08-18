const express = require("express");
const validate = require("../middlewares/validate");
const newsletterValidation = require("../validations/newsletter.validation");
const newsletterController = require("../controllers/newsletter.controller");

const router = express.Router();

router
  .route("/")
  .post(validate(newsletterValidation.createNewsletter), newsletterController.createNewsletter)
  .get(newsletterController.getAllNewsletters);

router
  .route("/:id")
  .get(newsletterController.getNewsletter)
  .delete(newsletterController.deleteNewsletter);

module.exports = router;
