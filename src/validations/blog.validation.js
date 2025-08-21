const Joi = require("joi");

const createBlogCategory = {
  body: Joi.object({
    name: Joi.string().required(),
    isActive: Joi.boolean().default(true),
  }),
};

const updateBlogCategory = {
  params: Joi.object({
    categoryId: Joi.number().required(),
  }),
  body: Joi.object({
    name: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

const categoryIdParam = {
  params: Joi.object({
    categoryId: Joi.number().required(),
  }),
};

const createBlog = {
  body: Joi.object({
    title: Joi.string().required(),
    slug: Joi.string().required(),
    categoryId: Joi.number().required(),
    bannerImage: Joi.string().uri().optional(),
    shortDescription: Joi.string().optional(),
    description: Joi.string().optional(),
    metaTitle: Joi.string().optional(),
    metaImage: Joi.string().uri().optional(),
    metaDescription: Joi.string().optional(),
    metaKeywords: Joi.string().optional(),
  }),
};

const updateBlog = {
  params: Joi.object({
    blogId: Joi.number().required(),
  }),
  body: Joi.object({
    title: Joi.string().optional(),
    slug: Joi.string().optional(),
    categoryId: Joi.number().optional(),
    bannerImage: Joi.string().uri().optional(),
    shortDescription: Joi.string().optional(),
    description: Joi.string().optional(),
    metaTitle: Joi.string().optional(),
    metaImage: Joi.string().uri().optional(),
    metaDescription: Joi.string().optional(),
    metaKeywords: Joi.string().optional(),
    isActive: Joi.boolean().optional(),

  }).min(1),
};

const blogIdParam = {
  params: Joi.object({
    blogId: Joi.number().required(),
  }),
};

module.exports = {
  createBlogCategory,
  updateBlogCategory,
  categoryIdParam,
  createBlog,
  updateBlog,
  blogIdParam,
};
