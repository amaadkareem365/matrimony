const express = require("express");
const router = express.Router();
const { faqController } = require("../controllers");
const validate = require("../middlewares/validate");
const faqValidation = require("../validations/faq.validation");

// Category Routes
router.post("/categories", validate(faqValidation.createCategory), faqController.createCategory);
router.get("/categories", faqController.getAllCategories);
router.patch("/categories/:categoryId", validate(faqValidation.updateCategory), faqController.updateCategory);
router.delete("/categories/:categoryId", validate(faqValidation.categoryIdParam), faqController.deleteCategory);

// FAQ Routes
router.post("/", validate(faqValidation.createFAQ), faqController.createFAQ);
router.get("/", faqController.getAllFAQs);
router.patch("/:faqId", validate(faqValidation.updateFAQ), faqController.updateFAQ);
router.delete("/:faqId", validate(faqValidation.faqIdParam), faqController.deleteFAQ);

module.exports = router;
