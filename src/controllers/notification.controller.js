const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const  notificationService  = require("../services/notification.service");

// Get all notifications for the logged-in user
const getNotifications = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const notifications = await notificationService.getAllNotifications(userId);
  res.status(httpStatus.OK).send(notifications);
});

// Mark a single notification as read
const markAsRead = catchAsync(async (req, res) => {
  const { notificationId } = req.params;
  const userId = req.user.id;

  const updatedNotification = await notificationService.markAsRead(
    notificationId,
    userId
  );
  if (!updatedNotification) {
    return res
      .status(httpStatus.NOT_FOUND)
      .send({ message: "Notification not found or unauthorized" });
  }

  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "Notification marked as read" });
});

// Mark all notifications as read for the user
const markAllAsRead = catchAsync(async (req, res) => {
  const userId = req.user.id;
  await notificationService.markAllAsRead(userId);
  res
    .status(httpStatus.OK)
    .send({ status: "success", message: "All notifications marked as read" });
});

module.exports = {
  getNotifications,
  markAsRead,
  markAllAsRead,
};
