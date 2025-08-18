const express = require("express");
const router = express.Router();
const packageController = require("../controllers/package.controller");
const validate = require("../middlewares/validate");
const packageValidation = require("../validations/package.validation");

router.post("/", validate(packageValidation.createPackage), packageController.createPackage);
router.get("/", packageController.getAllPackages);
router.get("/:packageId", validate(packageValidation.packageIdParam), packageController.getPackageById);
router.patch("/:packageId", validate(packageValidation.updatePackage), packageController.updatePackage);
router.delete("/:packageId", validate(packageValidation.packageIdParam), packageController.deletePackage);

module.exports = router;
