const mongoose = require("mongoose");
const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

const errorConverter = (err, req, res, next) => {
  let error = err;
  if (!(error instanceof ApiError)) {
    const statusCode =
      error.statusCode || error instanceof mongoose.Error
        ? httpStatus.BAD_REQUEST
        : httpStatus.INTERNAL_SERVER_ERROR;
    const message = error.message || httpStatus[statusCode];
    error = new ApiError(statusCode, message, false, err.stack);
  }
  console.log(error);
  next(error);
};

// Function to extract property names from error message parts
const extractRequiredProperties = (messageParts) => {
  return messageParts
    .map((part) => {
      const match = part.match(/\"(.*)\" is required/);
      return match ? match[1] : null;
    })
    .filter(Boolean); // Filter out null values
};
// Function to construct a generic message for required fields
const constructRequiredFieldsMessage = (properties) => {
  if (properties.length > 0) {
    const requiredFields = properties.join(" and ");
    return `${requiredFields} are required`;
  }
  return null;
};

// eslint-disable-next-line no-unused-vars
const errorHandler = (err, req, res, next) => {
  let { statusCode, message } = err;

  console.log(err.name);
  if (process.env.NODE_ENV === "production" && !err.isOperational) {
    statusCode = httpStatus.INTERNAL_SERVER_ERROR;
    message = httpStatus[httpStatus.INTERNAL_SERVER_ERROR];
  }

  res.locals.errorMessage = err.message;

  const messageParts = message.split(",");
  // Extract property names from message parts
  const properties = extractRequiredProperties(messageParts);
  // Construct a generic message for required fields
  const genericMessage = constructRequiredFieldsMessage(properties);
  if (genericMessage) {
    message = genericMessage;
  }

  const response = {
    code: statusCode,
    message,
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  };

  if (process.env.NODE_ENV === "development") {
    console.log(err);
  }

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
