const rateLimit = require('express-rate-limit');

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 2000,
  skipSuccessfulRequests: true,
});

module.exports = {
  authLimiter,
};
