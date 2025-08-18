const Joi = require("joi");

// CATEGORY
const createCategory = {
  body: Joi.object({
    name: Joi.string().required(),
    isActive: Joi.boolean().default(true),
  }),
};

const updateCategory = {
  params: Joi.object({ categoryId: Joi.number().required() }),
  body: Joi.object({
    name: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

const categoryIdParam = {
  params: Joi.object({ categoryId: Joi.number().required() }),
};

// FAQ
const createFAQ = {
  body: Joi.object({
    question: Joi.string().required(),
    answer: Joi.string().required(),
    categoryId: Joi.number().required(),
  }),
};

const updateFAQ = {
  params: Joi.object({ faqId: Joi.number().required() }),
  body: Joi.object({
    question: Joi.string().optional(),
    answer: Joi.string().optional(),
    categoryId: Joi.number().optional(),
  }).min(1),
};

const faqIdParam = {
  params: Joi.object({ faqId: Joi.number().required() }),
};

module.exports = {
  createCategory,
  updateCategory,
  categoryIdParam,
  createFAQ,
  updateFAQ,
  faqIdParam,
};
