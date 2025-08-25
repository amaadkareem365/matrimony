const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const emailService = require('../services/email.service');

const {
  authService,
  userService,
  tokenService,
  sgEmailService
} = require("../services");

const register = catchAsync(async (req, res) => {
  const user = await userService.createUser(req.body);

  await emailService.sendWelcomeEmail(user.id);
  const otp = await authService.generateAndStoreOTP(user.id);
  await emailService.sendOtpEmail(user.id, otp);
  res.status(httpStatus.CREATED).json({
    status: "success",
    message: "User registered successfully.",
    data: {
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    },
  });
});

const login = catchAsync(async (req, res) => {
  const { email, password } = req.body;

  const user = await authService.loginUserWithCredentials({
    email,
    password,
  });

  const otp = await authService.generateAndStoreOTP(user.id);
  await emailService.sendOtpEmail(user.id, otp);


  res.status(httpStatus.OK).json({
    user,
  });
});

const getMe = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const user = await authService.getUser(userId);
  if (user.packageEnd) {
    const now = new Date();
    const fiveDaysBefore = new Date(user.packageEnd);
    fiveDaysBefore.setDate(fiveDaysBefore.getDate() - 5);

    if (now >= fiveDaysBefore && now < user.packageEnd) {
      await emailService.sendPackageExpiryWarningEmail({ userId: user.id });
    }
  }
  res.send({ user: user });
});


const resendOTP = catchAsync(async (req, res) => {
  const { email } = req.body;

  // Fetch user by email
  const user = await userService.getUserByEmail(email);
  if (!user) {
    return res
      .status(httpStatus.NOT_FOUND)
      .json({ message: "User not found." });
  }

  // Generate and store new OTP
  const otp = await authService.resendOTP(user.id);
  await emailService.sendOtpEmail(user.id, otp);
  res.status(httpStatus.OK).json({
    message: "A new OTP has been sent to your email.",
  });
});
const changePassword = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { currentPassword, newPassword } = req.body;

  await authService.changeUserPassword(userId, currentPassword, newPassword);
  await authService.createUserActivity(userId, "PASSWORD_CHANGED", `PASSWORD GOT UPDATED`);

  res.status(httpStatus.OK).json({ message: "Password changed successfully" });
});

const updateAdmin = catchAsync(async (req, res) => {
  const { id } = req.params;
  const updatedUser = await userService.updateAdmin(+id, req.body);
  if (updatedUser.role = "ADMIN") {
    await authService.createUserActivity(updatedUser.id, "PROFILE_UPDATED", `Admin updated his profile`);
  }
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Admin updated successfully.",
    data: updatedUser,
  });
});
const verifyEmail = catchAsync(async (req, res) => {
  const { otp, email } = req.body;
  // Assuming user is authenticated and ID is available
  const user = await userService.getUserByEmail(email);
  const userId = user.id;
  const isVerified = await authService.verifyOTP(userId, otp);
  if (!isVerified) {
    await authService.createUserActivity(user.id, "LOGIN_FAILED", `OTP verification failed`);
    return res.status(httpStatus.BAD_REQUEST).send({
      isVerified,
      message: "Invalid or expired OTP.",
    });
  }
  const tokens = await tokenService.generateAuthTokens(user, true);
  if (user.role = "ADMIN") {
    await authService.createUserActivity(user.id, "LOGIN_SUCCESS", `OTP verified  correctly`);
  }
  // Mark user as verified
  res.status(httpStatus.OK).send({
    status: "success",
    user,
    tokens,
  });
});


const getMyActivities = catchAsync(async (req, res) => {
  const userId = req.user.id; // assuming req.user is set by auth middleware
  const { skip, take } = req.query;
  const activities = await authService.getUserActivities(userId, {
    skip,
    take,
  });

  res.status(200).json({
    success: true,
    activities,
  });
});




const forgotPassword = catchAsync(async (req, res) => {
  const { resetPasswordToken } =
    await tokenService.generateResetPasswordToken(req.body);
  console.log({
    resetPasswordToken,
  });

  await emailService.sendForgotPasswordEmail(
    req.body.email,
    resetPasswordToken
  );
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Reset password email sent successfully.",
  });
});

const resetPassword = catchAsync(async (req, res) => {
  await authService.resetPassword(
    req.query.token,
    req.body.password
  );
  res.status(httpStatus.OK).send({
    status: "success",
    message: "Password reset successfully.",
  });
});


module.exports = {
  forgotPassword,
  resetPassword,

  getMyActivities,
  register,
  login,
  getMe,
  changePassword,
  updateAdmin,
  verifyEmail,
  resendOTP
};


