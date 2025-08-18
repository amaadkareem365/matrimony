const express = require("express");
const validate = require("../middlewares/validate");
const bannerValidation = require("../validations/banner.validation");
const bannerController = require("../controllers/banner.controller");

const router = express.Router();

router
  .route("/")
  .post(validate(bannerValidation.createBanner), bannerController.createBanner)
  .get(bannerController.getAllBanners);

router
  .route("/:id")
  .get(validate(bannerValidation.bannerIdParam), bannerController.getBanner)
  .patch(validate(bannerValidation.updateBanner), bannerController.updateBanner)
  .delete(validate(bannerValidation.bannerIdParam), bannerController.deleteBanner);

module.exports = router;