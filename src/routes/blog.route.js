const express = require("express");
const router = express.Router();
const {blogController} = require("../controllers");
const validate = require("../middlewares/validate");
const {blogValidation }= require("../validations");

// Categories
router.post("/categories", validate(blogValidation.createBlogCategory), blogController.createBlogCategory);
router.get("/categories", blogController.getAllBlogCategories);
router.patch("/categories/:categoryId", validate(blogValidation.updateBlogCategory), blogController.updateBlogCategory);
router.delete("/categories/:categoryId", validate(blogValidation.categoryIdParam), blogController.deleteBlogCategory);

// Blogs
router.post("/", validate(blogValidation.createBlog), blogController.createBlog);
router.get("/", blogController.getAllBlogs);
router.get("/:blogId", validate(blogValidation.blogIdParam), blogController.getBlogById);
router.patch("/:blogId", validate(blogValidation.updateBlog), blogController.updateBlog);
router.delete("/:blogId", validate(blogValidation.blogIdParam), blogController.deleteBlog);

module.exports = router;
