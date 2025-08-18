const Joi = require("joi");

const createPackage = {
  body: Joi.object({
    name: Joi.string().required(),
    price: Joi.number().positive().required(),
    image: Joi.string().uri().optional(),
    validity: Joi.number().integer().positive().required(), // in days
    isActive: Joi.boolean().optional(),
    features:Joi.string().optional()
  }),
};

const updatePackage = {
  params: Joi.object({ packageId: Joi.number().required() }),
  body: Joi.object({
    name: Joi.string().optional(),
    price: Joi.number().positive().optional(),
    image: Joi.string().uri().optional(),
    validity: Joi.number().integer().positive().optional(),
    isActive: Joi.boolean().optional(),
     features:Joi.string().optional()
  }).min(1),
};

const packageIdParam = {
  params: Joi.object({ packageId: Joi.number().required() }),
};

module.exports = {
  createPackage,
  updatePackage,
  packageIdParam,
};
