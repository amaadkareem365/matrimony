const Joi = require("joi");

const idParam = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
};

const create = {
  body: Joi.object({
    key: Joi.string().required(),
    label: Joi.string().required(),
    type: Joi.string().valid("text", "select", "boolean", "number", "multiselect").required(),
    options: Joi.string().optional(), // Comma-separated
    isActive: Joi.boolean().optional(),
    isVisible: Joi.boolean().optional(),
    isRequired: Joi.boolean().optional(),
    order: Joi.number().optional(),
  }),
};

const update = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
  body: Joi.object({
    label: Joi.string().optional(),
    type: Joi.string().valid("text", "select", "boolean", "number", "multiselect").optional(),
    options: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    isVisible: Joi.boolean().optional(),
    isRequired: Joi.boolean().optional(),
    order: Joi.number().optional(),
  }).min(1),
};

const modifyOption = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
  body: Joi.object({
    option: Joi.string().required(),
  }),
};

module.exports = {
  idParam,
  create,
  update,
  modifyOption,
};
