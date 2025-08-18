const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const paymentService = require("../services/payment.service");

const createPayment = catchAsync(async (req, res) => {
  const { packageId, provider } = req.body;
  const userId = req.user.id; // assuming auth middleware

  let paymentData;
  if (provider === "stripe") {
    paymentData = await paymentService.createStripePayment(packageId, userId);
  } else if (provider === "mollie") {
    paymentData = await paymentService.createMolliePayment(packageId, userId);
  } else {
    return res.status(httpStatus.BAD_REQUEST).json({ message: "Invalid provider" });
  }

  res.status(httpStatus.OK).json({
    status: "success",
    message: "Payment created successfully",
    data: paymentData,
  });
});

module.exports = { createPayment };
