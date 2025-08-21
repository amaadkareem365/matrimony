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

const getAllBlogs = async ({ isActive, page, limit }) => {
  // Global counts
  const [totalBlogs, activeBlogs, inactiveBlogs] = await Promise.all([
    prisma.blog.count(),
    prisma.blog.count({ where: { isActive: true } }),
    prisma.blog.count({ where: { isActive: false } }),
  ]);

  // Get all categories (only active ones)
  const categories = await prisma.blogCategory.findMany({
    where: { isActive: true },
    orderBy: { name: "asc" },
  });

  // For each category, fetch paginated blogs
  const result = await Promise.all(
    categories.map(async (category) => {
      const whereClause = {
        categoryId: category.id,
        ...(isActive !== undefined && {
          isActive: isActive === "true",
        }),
      };

      const [blogs, total] = await Promise.all([
        prisma.blog.findMany({
          where: whereClause,
          orderBy: { createdAt: "desc" },
          skip: (page - 1) * limit,
          take: limit,
        }),
        prisma.blog.count({ where: whereClause }),
      ]);

      return {
        id: category.id,
        name: category.name,
        blogs,
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    })
  );

  return {
    stats: {
      totalBlogs,
      activeBlogs,
      inactiveBlogs,
    },
    categoryNames: categories.map((c) => c.name), // 👈 new array
    categories: result,
  };
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
