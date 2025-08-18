const Joi = require("joi");

const createBanner = {
  body: Joi.object({
    name: Joi.string().required(),
    link: Joi.string().uri().required(),
    bannerImage: Joi.string().uri().required(),
    startDate: Joi.date().required(),
    endDate: Joi.date().required(),
    cpm: Joi.number().optional(),
    page: Joi.string().required(),
    isActive: Joi.boolean().optional(),
  }),
};

const updateBanner = {
  body: Joi.object({
    name: Joi.string().optional(),
    link: Joi.string().uri().optional(),
    bannerImage: Joi.string().uri().optional(),
    startDate: Joi.date().optional(),
    endDate: Joi.date().optional(),
    cpm: Joi.number().optional(),
    page: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

const bannerIdParam = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
};

module.exports = {
  createBanner,
  updateBanner,
  bannerIdParam,
};