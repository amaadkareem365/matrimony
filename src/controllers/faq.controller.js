const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");
const { faqService } = require("../services");

// --- Categories ---
const createCategory = catchAsync(async (req, res) => {
  const category = await faqService.createCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getAllCategories = catchAsync(async (req, res) => {
  const categories = await faqService.getAllCategories();
  res.send(categories);
});

const updateCategory = catchAsync(async (req, res) => {
  const updated = await faqService.updateCategory(+req.params.categoryId, req.body);
  res.send(updated);
});

const deleteCategory = catchAsync(async (req, res) => {
  await faqService.deleteCategory(+req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

// --- FAQs ---
const createFAQ = catchAsync(async (req, res) => {
  const faq = await faqService.createFAQ(req.body);
  res.status(httpStatus.CREATED).send(faq);
});

const getAllFAQs = catchAsync(async (req, res) => {
  const faqs = await faqService.getAllFAQs();
  res.send(faqs);
});

const updateFAQ = catchAsync(async (req, res) => {
  const updated = await faqService.updateFAQ(+req.params.faqId, req.body);
  res.send(updated);
});

const deleteFAQ = catchAsync(async (req, res) => {
  await faqService.deleteFAQ(+req.params.faqId);
  res.status(httpStatus.NO_CONTENT).send();
});

module.exports = {
  createCategory,
  getAllCategories,
  updateCategory,
  deleteCategory,
  createFAQ,
  getAllFAQs,
  updateFAQ,
  deleteFAQ,
};
