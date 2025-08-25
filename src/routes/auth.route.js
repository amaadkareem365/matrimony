const express = require("express");
const validate = require("../middlewares/validate");
const { authValidation } = require("../validations");
const { authController } = require("../controllers");
const auth = require("../middlewares/auth");

const router = express.Router();

router.post(
  "/register",
  validate(authValidation.register),
  authController.register
);

router.post("/login", validate(authValidation.login), authController.login);
router.post(
  "/resend-otp",
  validate(authValidation.resendOtp),
  authController.resendOTP
);

router.post(
  "/verify-email",
  validate(authValidation.verifyEmailValidation),
  authController.verifyEmail
);

router.get("/get-me", auth(), authController.getMe);


router.post(
  "/change-password",
  auth(), // middleware to ensure user is authenticated
  validate(authValidation.changePassword),
  authController.changePassword
);

router.patch(
  "/update-admin/:id",
  // auth("updateAdmin"), // middleware to ensure user is authenticated
  validate(authValidation.updateAdmin),
  authController.updateAdmin
);
router.get(
  "/get-activities",
  auth(),
  authController.getMyActivities
);
router.post(
  "/forget-password",
  authController.forgotPassword
);
router.post(
  "/reset-password",
  authController.resetPassword
);





module.exports = router;
