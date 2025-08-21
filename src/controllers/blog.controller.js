const catchAsync = require("../utils/catchAsync");
const httpStatus = require("http-status");
const { blogService } = require("../services");

// Blog Category
const createBlogCategory = catchAsync(async (req, res) => {
  const category = await blogService.createBlogCategory(req.body);
  res.status(httpStatus.CREATED).send(category);
});

const getAllBlogCategories = catchAsync(async (req, res) => {
  const categories = await blogService.getAllBlogCategories();
  res.send(categories);
});

const updateBlogCategory = catchAsync(async (req, res) => {
  const category = await blogService.updateBlogCategory(+req.params.categoryId, req.body);
  res.send(category);
});

const deleteBlogCategory = catchAsync(async (req, res) => {
  await blogService.deleteBlogCategory(+req.params.categoryId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Blog
const createBlog = catchAsync(async (req, res) => {
  const blog = await blogService.createBlog(req.body);
  res.status(httpStatus.CREATED).send(blog);
});

// const getAllBlogs = catchAsync(async (req, res) => {
//   const blogs = await blogService.getAllBlogs();
//   res.send(blogs);
// });

const getAllBlogs = catchAsync(async (req, res) => {
  const { isActive, page = 1, limit = 5 } = req.query;

  const categories = await blogService.getAllBlogs({
    isActive,
    page: parseInt(page),
    limit: parseInt(limit),
  });

  res.send({ categories });
});

const getBlogById = catchAsync(async (req, res) => {
  const blog = await blogService.getBlogById(+req.params.blogId);
  res.send(blog);
});

const updateBlog = catchAsync(async (req, res) => {
  const updated = await blogService.updateBlog(+req.params.blogId, req.body);
  res.send(updated);
});

const deleteBlog = catchAsync(async (req, res) => {
  await blogService.deleteBlog(+req.params.blogId);
  res.status(httpStatus.NO_CONTENT).send();
});

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
