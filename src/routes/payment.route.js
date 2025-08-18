const express = require("express");
const validate = require("../middlewares/validate");
const auth = require("../middlewares/auth");
const paymentController = require("../controllers/payment.controller");
const Joi = require("joi");

const router = express.Router();

const createPaymentValidation = {
  body: Joi.object({
    packageId: Joi.number().required(),
    provider: Joi.string().valid("stripe", "mollie").required(),
  }),
};

router.post(
  "/create",
  auth(), // user must be logged in
  validate(createPaymentValidation),
  paymentController.createPayment
);

module.exports = router;
