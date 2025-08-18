const express = require("express");
const auth = require("../../middlewares/auth");
const  notificationController  = require("../controllers/notification.controller");

const router = express.Router();

// Get all notifications for the logged-in user
router.get("/", auth(), notificationController.getNotifications);

// Mark a single notification as read
router.patch(
  "/:notificationId/mark-as-read",
  auth(),
  notificationController.markAsRead
);

// Mark all notifications as read
router.patch(
  "/mark-all-as-read",
  auth(),
  notificationController.markAllAsRead
);

module.exports = router;
