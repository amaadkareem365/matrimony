const express = require("express");
const router = express.Router();
const validate = require("../middlewares/validate");
const { profileAttributeValidation } = require("../validations");
const { profileAttributeController } = require("../controllers");

router.post("/", validate(profileAttributeValidation.create), profileAttributeController.create);
router.get("/", profileAttributeController.getAll);
router.get("/:id", validate(profileAttributeValidation.idParam), profileAttributeController.getById);
router.patch("/:id", validate(profileAttributeValidation.update), profileAttributeController.update);
router.delete("/:id", validate(profileAttributeValidation.idParam), profileAttributeController.remove);
router.get("/key/:key", profileAttributeController.getByKey);


// Manage options
router.patch("/:id/add-option", validate(profileAttributeValidation.modifyOption), profileAttributeController.addOption);
router.patch("/:id/remove-option", validate(profileAttributeValidation.modifyOption), profileAttributeController.removeOption);

module.exports = router;
