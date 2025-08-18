const express = require("express");

const { presignedUploadUrl } = require("../controllers/presignedController");
const router = express.Router();

// Route to create a new template (admin only)
router.route("/images/:filename").get(presignedUploadUrl);

module.exports = router;
