const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const catchAsync = require("../utils/catchAsync");
const Pusher = require("pusher");
const pusher = new Pusher({
  appId: process.env.PUSHER_APP_ID,
  key: process.env.PUSHER_KEY,
  secret: process.env.PUSHER_SECRET,
  cluster: process.env.PUSHER_CLUSTER,
  useTLS: true,
});
const { PrismaClient } = require("@prisma/client");

const prisma = new PrismaClient();


exports.getMessage = async (req, res, next) => {
  try {
    const chatId = parseInt(req.params.chatId);
    const { cursor, take = 20 } = req.query;

    const messages = await prisma.message.findMany({
      where: { chatId },
      take: +take,
      ...(cursor && {
        skip: 1, // skip the cursor itself
        cursor: { id: parseInt(cursor) },
      }),
      orderBy: { createdAt: "desc" },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    res.status(200).json({
      status: "success",
      messages: messages.length,
      data: {
        messages,
        nextCursor:
          messages.length > 0 ? messages[messages.length - 1].id : null,
      },
    });
  } catch (err) {
    console.error("Error fetching messages:", err);
    res.status(404).json({
      status: "fail",
      data: { message: err.message },
    });
  }
};


exports.sendMessage = async (req, res, next) => {
  const { chatId, content } = req.body;
  if (!chatId) return next(new ApiError("Please provide chat ID", 400));

  try {
    // Create message
    const newMessage = await prisma.message.create({
      data: {
        content,
        sender: { connect: { id: req.user.id } },
        chat: { connect: { id: parseInt(chatId) } },
      },
      include: {
        sender: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    const sender = newMessage.sender;

    // ✅ Get chat participants via ChatUser
    const chatUsers = await prisma.chatUser.findMany({
      where: { chatId: +chatId },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            image: true,
          },
        },
      },
    });

    // 1. Trigger real-time message event
    try {
      await pusher.trigger(`chat-${chatId}`, "new-message", {
        content,
        sender: {
          id: sender.id,
          firstName: sender.firstName,
          lastName: sender.lastName,
          image: sender.image,
        },
        chatId: +chatId,
        tempId: Date.now(),
      });
    } catch (error) {
      console.error("Error triggering Pusher event:", error);
    }

    // 2. Notifications for other users
    const notificationPromises = chatUsers
      .filter(({ user }) => user.id !== sender.id)
      .map(async ({ user: receiver }) => {
        const notificationContent = `New message from ${sender.firstName} ${sender.lastName}`;

        const notificationData = {
          senderId: sender.id,
          receiverId: receiver.id,
          type: "message",
          content: notificationContent,
          extra: {
            chatId: +chatId,
            messageId: newMessage.id,
            sender: {
              id: sender.id,
              name: `${sender.firstName} ${sender.lastName}`,
              image: sender?.image || "",
            },
            preview:
              content.length > 50 ? `${content.substring(0, 50)}...` : content,
          },
          isRead: false,
        };

        try {
          // Create notification in DB
          const notification = await prisma.notification.create({
            data: notificationData,
          });

          // Update unread counts
          await prisma.chatUserMeta.upsert({
            where: {
              chatId_userId: { chatId: +chatId, userId: receiver.id },
            },
            update: { unreadCount: { increment: 1 } },
            create: {
              chatId: +chatId,
              userId: receiver.id,
              unreadCount: 1,
            },
          });

          await prisma.user.update({
            where: { id: receiver.id },
            data: { messageCount: { increment: 1 } },
          });

          // Trigger real-time notification
          await pusher.trigger(
            `user-${receiver.id}`,
            "new-message-notification",
            {
              id: notification.id,
              createdAt: notification.createdAt,
              ...notificationData.extra,
            }
          );
        } catch (error) {
          console.error(`Notification failed for user ${receiver.id}:`, error);
        }
      });

    await Promise.all(notificationPromises);

    res.status(200).json({
      status: "success",
      data: { message: newMessage.content },
    });
  } catch (err) {
    console.error("Error sending message:", err);
    res.status(400).json({
      status: "fail",
      message: err.message,
    });
  }
};

// pusherAuth.js
exports.authenticatePusher = async (req, res) => {
  const socketId = req.body.socket_id;
  const channel = req.body.channel_name;
  const userId = req.user.id; // From authenticated session

  if (channel.startsWith('presence-')) {
    const presenceData = {
      user_id: userId.toString(),
      user_info: {
        name: `${req.user.firstName} ${req.user.lastName}`,
        image: req.user.image
      }
    };
    
    const authResponse = pusher.authenticate(socketId, channel, presenceData);
    return res.send(authResponse);
  }
  
  res.status(403).send('Forbidden');
};


const updateUserStatus = async (userId, isOnline) => {
  await prisma.user.update({
    where: { id: userId },
    data: {
      isOnline,
      lastSeen: isOnline ? new Date() : undefined
    }
  });
};

exports.handlePresenceWebhook = async (req, res) => {
  // Verify webhook signature first (omitted for brevity)
  
  req.body.events.forEach(event => {
    const userId = parseInt(event.user_id);
    
    if (event.name === 'member_added') {
      updateUserStatus(userId, true);
    }
    else if (event.name === 'member_removed') {
      updateUserStatus(userId, false);
    }
  });
  
  res.status(200).send('OK');
};

