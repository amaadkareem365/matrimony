const express = require("express");
const helmet = require("helmet");
const xss = require("xss-clean");
const hpp = require("hpp");
const compression = require("compression");
const passport = require("passport");
const httpStatus = require("http-status");
const cors = require("cors");
const rateLimit = require("express-rate-limit");

const { jwtStrategy } = require("./src/config/passport");
const { authLimiter } = require("./src/middlewares/rateLimiter");
const routes = require("./src/routes");
const { errorConverter, errorHandler } = require("./src/middlewares/error");
const ApiError = require("./src/utils/ApiError");

const app = express();
const isProduction = process.env.NODE_ENV === "production";

// CORS
app.use(cors());
app.options("*", cors());

// Helmet Security Headers
app.use(
  helmet({
    contentSecurityPolicy: isProduction
      ? {
          directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "https:"],
            objectSrc: ["'none'"],
            upgradeInsecureRequests: [],
          },
        }
      : false,
    hsts: isProduction
      ? {
          maxAge: 31536000,
          includeSubDomains: true,
          preload: true,
        }
      : false,
  })
);

// Rate Limiting
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 500,
    message: "Too many requests from this IP, please try again later",
  })
);
if (isProduction) {
  app.use("/api/v1", authLimiter);
}

// Body Parsing & Sanitization
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(xss());
app.use(hpp());
app.use(compression());

// Passport JWT Auth
app.use(passport.initialize());
passport.use("jwt", jwtStrategy);

// API Routes
app.use("/api/v1", routes);

// 404 Handler
app.use((req, res, next) => {
  next(new ApiError(httpStatus.NOT_FOUND, "Not found"));
});

// Error Handlers
app.use(errorConverter);
app.use(errorHandler);

module.exports = app;
