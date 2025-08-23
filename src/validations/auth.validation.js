const Joi = require("joi");
const { Role } = require("@prisma/client");


const register = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
    role: Joi.string().valid("CLIENT", "ADMIN").default("CLIENT"),
    username: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    image: Joi.string().uri().optional(),
    dob: Joi.date().optional(),
    department: Joi.string().optional(),
    phone: Joi.string().pattern(/^[0-9]{10,15}$/).optional(),
    location: Joi.string().optional(),
    origin: Joi.string().optional(),
    gender: Joi.string().optional(),
    age: Joi.number().integer().optional(),
    relationshipStatus: Joi.string().optional(),
    children: Joi.string().optional(),
    religion: Joi.string().optional(),
    shortDescription: Joi.string().optional(),
    adminId:Joi.integer().optional()
  }),
};

const login = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().required(),
  }),
};

const changePassword = {
  body: Joi.object({
    currentPassword: Joi.string().required(),
    newPassword: Joi.string().min(6).required(),
  }),
};


const updateAdmin = {
  params: Joi.object({
    id: Joi.number().required(),
  }),
  body: Joi.object({
    username: Joi.string().optional(),
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    location: Joi.string().optional(),
    department: Joi.string().optional(),
    image: Joi.string().uri().optional(),
  }),
};


const verifyEmailValidation = {
  body: Joi.object().keys({
    otp: Joi.string().length(5).required(), // Ensure OTP is exactly 5 digits
    email: Joi.string().email().required(),
  }),
};

const resendOtp = {
  body: Joi.object().keys({
    email: Joi.string().email().required(),
  }),
};
module.exports = {
  register,
  login,
  changePassword,
  updateAdmin,
  verifyEmailValidation,
  resendOtp
};


