const prisma = require("../utils/db");

const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");

// Get all notifications for a user
const getAllNotifications = async (userId) => {
  return prisma.notification.findMany({
    where: { receiverId: +userId },
    orderBy: { createdAt: "desc" },
    include: {
      sender: {
        select: {
          firstName: true,
          lastName: true,
          profileImage: true,
        },
      },
    },
  });
};

// Mark a single notification as read
const markAsRead = async (notificationId, userId) => {
  const notification = await prisma.notification.findUnique({
    where: { id: parseInt(notificationId) },
  });

  if (!notification) {
    throw new ApiError(
      httpStatus.NOT_FOUND,
      "Notification not found or unauthorized"
    );
  }

  return prisma.notification.update({
    where: { id: parseInt(notificationId) },
    data: { isRead: true },
  });
};

// Mark all notifications as read for a user
const markAllAsRead = async (userId) => {
  await prisma.notification.updateMany({
    where: {
      receiverId: +userId,
      isRead: false,
    },
    data: {
      isRead: true,
    },
  });
};

module.exports = {
  getAllNotifications,
  markAsRead,
  markAllAsRead,
};
