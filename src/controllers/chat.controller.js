
const { PrismaClient } = require("@prisma/client");
const prisma = new PrismaClient();


// const accessChat = async (req, res, next) => {
//   const { userId } = req.body;

//   if (!userId) {
//     console.log("User ID was not sent with the request body");
//     return res.status(400).json({
//       message: "User ID is not sent",
//     });
//   }

//   const currentUserId = req.user.id;
//   const otherUserId = parseInt(userId);

//   try {
//     // ✅ Check that both users exist
//     const existingUsers = await prisma.user.findMany({
//       where: {
//         id: { in: [currentUserId, otherUserId] },
//       },
//       select: { id: true },
//     });

//     if (existingUsers.length !== 2) {
//       return res.status(404).json({
//         message: "One or both users not found",
//       });
//     }

//     // ✅ Check if chat already exists
//     const isChat = await prisma.chat.findFirst({
//       where: {
//         AND: [
//           {
//             users: {
//               some: { id: currentUserId },
//             },
//           },
//           {
//             users: {
//               some: { id: otherUserId },
//             },
//           },
//         ],
//       },
//       include: {
//         users: {
//           select: {
//             id: true,
//             email: true,
//             firstName: true,
//             lastName: true,
//           },
//         },
//       },
//     });

//     if (isChat) {
//       return res.send({
//         data: {
//         fullChat: isChat,
//       },
//       });
//     }

//     // ✅ Create new chat if it doesn't exist
//     const createdChat = await prisma.chat.create({
//       data: {
//         chatName: "sender",
//         users: {
//           connect: [{ id: currentUserId }, { id: otherUserId }],
//         },
//       },
//       include: {
//         users: true,
//       },
//     });

//     return res.status(200).json({
//       message: "Chat created",
//       data: {
//         fullChat: createdChat,
//       },
//     });
//   } catch (error) {
//     console.error("Error accessing chat:", error);
//     return res.status(500).json({
//       status: "error",
//       message: "Failed to access chat",
//     });
//   }
// };
const accessChat = async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    console.log("User ID was not sent with the request body");
    return res.status(400).json({
      message: "User ID is not sent",
    });
  }

  const currentUserId = req.user.id;
  const otherUserId = parseInt(userId);

  try {
    // ✅ Ensure both users exist
    const existingUsers = await prisma.user.findMany({
      where: {
        id: { in: [currentUserId, otherUserId] },
      },
      select: { id: true },
    });

    if (existingUsers.length !== 2) {
      return res.status(404).json({
        message: "One or both users not found",
      });
    }

    // ✅ Check if a chat already exists between the two users
    const isChat = await prisma.chat.findFirst({
      where: {
        ChatUser: {
          some: { userId: currentUserId },
        },
        AND: {
          ChatUser: {
            some: { userId: otherUserId },
          },
        },
      },
      include: {
        ChatUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    if (isChat) {
      return res.json({
        data: {
          fullChat: isChat,
        },
      });
    }

    // ✅ Create new chat if it doesn’t exist
    const createdChat = await prisma.chat.create({
      data: {
        chatName: "sender",
        ChatUser: {
          create: [
            { userId: currentUserId },
            { userId: otherUserId },
          ],
        },
      },
      include: {
        ChatUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
              },
            },
          },
        },
      },
    });

    return res.status(200).json({
      message: "Chat created",
      data: {
        fullChat: createdChat,
      },
    });
  } catch (error) {
    console.error("Error accessing chat:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to access chat",
    });
  }
};


const getUserChats = async (req, res) => {
  const currentUserId = req.user.id;

  try {
    const chats = await prisma.chat.findMany({
      where: {
        ChatUser: {
          some: { userId: currentUserId },
        },
      },
      include: {
        ChatUser: {
          include: {
            user: {
              select: {
                id: true,
                email: true,
                firstName: true,
                lastName: true,
                image: true,
              },
            },
          },
        },
        messages: {
          orderBy: { createdAt: "desc" },
          take: 1, // only latest message
        },
      },
      orderBy: {
        updatedAt: "desc",
      },
    });

    return res.status(200).json({
      message: "Chats fetched successfully",
      data: chats,
    });
  } catch (error) {
    console.error("Error fetching chats:", error);
    return res.status(500).json({
      status: "error",
      message: "Failed to fetch chats",
    });
  }
};



const markChatAsRead = async (req, res) => {
  const chatId = parseInt(req.params.chatId);
  const userId = req.user.id;

  try {
    await prisma.chatUserMeta.update({
      where: {
        chatId_userId: {
          chatId,
          userId,
        },
      },
      data: {
        unreadCount: 0,
      },
    });

    res.status(200).json({ success: true,message:"message count reset for this chat" });
  } catch (err) {
    console.error("Failed to mark chat as read:", err);
    res.status(400).json({ error: "Failed to mark chat as read" });
  }
};


const resetMessageCount = async (req, res) => {
  try {
    await prisma.user.update({
      where: { id: req.user.id },
      data: { messageCount: 0 }
    });

    res.status(200).json({
      status: "success",
      message: "Message count reset to 0"
    });
  } catch (error) {
    console.error("Error resetting message count:", error);
    res.status(500).json({
      status: "error",
      message: "Failed to reset message count"
    });
  }
};

module.exports = {
  accessChat,
  markChatAsRead,
  getUserChats,
  resetMessageCount
};
