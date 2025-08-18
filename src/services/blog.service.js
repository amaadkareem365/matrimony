const prisma = require("../utils/db");

const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");
// Category
const createBlogCategory = async (data) => {
  return prisma.blogCategory.create({ data });
};

const getAllBlogCategories = async () => {
  return prisma.blogCategory.findMany({
    include: { blogs: true },
    orderBy: { name: "asc" },
  });
};

const updateBlogCategory = async (id, data) => {
  return prisma.blogCategory.update({
    where: { id },
    data,
  });
};

const deleteBlogCategory = async (id) => {
  await prisma.blogCategory.delete({ where: { id } });
};

// Blog
const createBlog = async (data) => {
  return prisma.blog.create({ data });
};

const getAllBlogs = async () => {
  return prisma.blog.findMany({
    include: { category: true },
    orderBy: { createdAt: "desc" },
  });
};

const getBlogById = async (id) => {
  return prisma.blog.findUnique({
    where: { id },
    include: { category: true },
  });
};

const updateBlog = async (id, data) => {
  return prisma.blog.update({ where: { id }, data });
};

const deleteBlog = async (id) => {
  await prisma.blog.delete({ where: { id } });
};

module.exports = {
  createBlogCategory,
  getAllBlogCategories,
  updateBlogCategory,
  deleteBlogCategory,
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
};
