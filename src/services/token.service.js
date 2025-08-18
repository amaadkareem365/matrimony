const jwt = require("jsonwebtoken");
const moment = require("moment");
const httpStatus = require("http-status");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const {  TokenType } = require("@prisma/client");
const prisma = require("../utils/db");


const config = {
  jwt: {
    secret: process.env.JWT_SECRET || "defaultsecret",
    accessExpirationMinutes: process.env.JWT_ACCESS_EXPIRATION_MINUTES || 43200,
    refreshExpirationDays: process.env.JWT_REFRESH_EXPIRATION_DAYS || 30,
    resetPasswordExpirationMinutes: 10,
    verifyEmailExpirationMinutes: 10,
  },
};




const generateToken = (userId, expires, type, secret = config.jwt.secret) => {
  const payload = {
    sub: userId,
    iat: moment().unix(),
    exp: expires.unix(),
    type,
  };
  return jwt.sign(payload, secret);
};

const saveToken = async (token, userId, expires, type, blacklisted = false) => {
  const createdToken = await prisma.token.create({
    data: {
      token,
      userId,
      type,
      expires: expires.toDate(),
      blacklisted,
    },
  });
  console.log(createdToken);
  return createdToken;
};

const verifyToken = async (token, type) => {
  const payload = jwt.verify(token, config.jwt.secret);
  console.log("executed....");
  const tokenDoc = await prisma.token.findFirst({
    where: {
      token: token,
      type: type,
      userId: payload.sub,
    },
    include: {
      user: true,
    },
  });

  if (!tokenDoc) {
    throw new Error("Token not found");
  }
  return tokenDoc;
};

const generateAuthTokens = async (user, register = false) => {
  const accessTokenExpires = moment().add("43800", "minutes");
  const accessToken = generateToken(
    user.id,
    accessTokenExpires,
    TokenType.ACCESS
  );

  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
  };
};

const generateAuthAccessToken = async (user) => {
  const accessTokenExpires = moment().add("1440", "minutes");
  console.log("this is the expiry time", accessTokenExpires);
  const accessToken = generateToken(
    user.id,
    accessTokenExpires,
    TokenType.ACCESS
  );

  const now = moment().startOf("day"); // Start of today

  // Get lastLogin date (if any), or set it to null if it's the first login
  const lastDecrementAt = user.lastDecrementAt
    ? moment(user.lastDecrementAt).startOf("day")
    : null;

  // Increment loginCount only if the user has not logged in today
  if (!lastDecrementAt || lastDecrementAt.isBefore(now)) {
    await prisma.user.update({
      where: { id: user.id },
      data: {
        loginCount: {
          increment: 1, // Increment login count by 1, only once per day
        },
        lastDecrementAt: now.toDate(), // Update lastLogin to today
      },
    });
  }
  return {
    access: {
      token: accessToken,
      expires: accessTokenExpires.toDate(),
    },
  };
};

/**
 * Generate reset password token
 * @param {string} email
 * @returns {Promise<string>}
 */
const generateResetPasswordToken = async ({ email }) => {
  const user = await userService.getUserByEmail(email);
  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "No users found with this email");
  }
  const expires = moment().add(10, "minutes");
  const resetPasswordToken = generateToken(
    user.id,
    expires,
    TokenType.RESET_PASSWORD
  );
  await saveToken(
    resetPasswordToken,
    user.id,
    expires,
    TokenType.RESET_PASSWORD,
    false
  );
  return { resetPasswordToken, user };
};

/**
 * Generate verify email token
 * @param {User} user
 * @returns {Promise<string>}
 */
const generateVerifyEmailToken = async (user) => {
  const expires = moment().add(
    config.jwt.verifyEmailExpirationMinutes,
    "minutes"
  );
  const verifyEmailToken = generateToken(
    user.id,
    expires,
    TokenType.VERIFY_EMAIL
  );
  await saveToken(verifyEmailToken, user.id, expires, TokenType.VERIFY_EMAIL);
  return verifyEmailToken;
};

module.exports = {
  generateToken,
  saveToken,
  verifyToken,
  generateAuthTokens,
  generateResetPasswordToken,
  generateVerifyEmailToken,
  generateAuthAccessToken,
};
