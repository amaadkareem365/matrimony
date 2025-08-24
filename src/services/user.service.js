const httpStatus = require("http-status");
const ApiError = require("../utils/ApiError");
const bcrypt = require("bcryptjs");
const crypto = require('crypto');
const { sendPackagePurchaseEmail,sendAccountDeletionEmail } = require("../services/email.service");

const prisma = require("../utils/db")


const createUser = async (userBody) => {
  console.log("Creating user with body:", userBody);
  if (!userBody.password) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Password is required");
  }
  const alreadyFoundUser = await prisma.user.findFirst({
    where: { email: userBody.email },
  });
  if (alreadyFoundUser) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "A user with this email already exists"
    );
  }

  const hashedPassword = await bcrypt.hash(userBody.password, 8);
  userBody["password"] = hashedPassword;

  const createdUser = await prisma.user.create({
    data: userBody,
  });
  return createdUser;
};

const getUserByEmail = async (email) => {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
    include: {
      allow: {
        include: {
          permissions: true, // Includes all related permissions
        },
      },
    },
  });
  return user;
};

const updateAdmin = async (id, updateData) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 8);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return updatedUser;
};



// Helper function to exclude password field
const exclude = (user, keys) => {
  return Object.fromEntries(
    Object.entries(user).filter(([key]) => !keys.includes(key))
  );
};



const getUserById = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: parseInt(userId) },
    include: {
      educationCareer: true,
      personalityBehavior: true,
      partnerExpectation: true,
      lifestyle: true,
      hobbiesInterests: true,
      language: true,
      living: true,
      physicalAppearance: true,
      PhotoSetting: true,
      UserPackage: {
        orderBy: {
          createdAt: 'desc', // or createdAt: 'desc'
        },
        take: 1, // only latest one
        include: {
          package: true, // ✅ fetch package details too
        },
      },
    }
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }
  const { UserPackage, ...rest } = user;
  return exclude({ ...rest, package: UserPackage[0] || null }, ['password']);
};
const getAllUsers = async (query) => {
  const {
    page = 1,
    limit = 10,
    search = "",
    status,
    gender,
    isPremium
  } = query;

  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  // Build filters based on search and other filters
  const filters = {
    AND: [
      { isDeleted: false },
      { role: { not: "ADMIN" } },
      search && {
        OR: [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { email: { contains: search } }
        ]
      },
      status === "active" && { isActive: true },
      status === "inactive" && { isActive: false },
      gender && { gender: { equals: gender } },
      isPremium !== undefined && { isPremium: isPremium === "true" }
    ].filter(Boolean)
  };

  // Query: users, filtered total, and general stats
  const [users, totalFiltered, totalUsers, activeUsers, inactiveUsers, premiumUsers] = await prisma.$transaction([
    prisma.user.findMany({
      where: filters,
      skip,
      take,
      orderBy: { createdAt: "desc" },
      include: {
        educationCareer: true,
        personalityBehavior: true,
        partnerExpectation: true,
        lifestyle: true,
        hobbiesInterests: true,
        language: true,
        living: true,
        physicalAppearance: true
      }
    }),
    prisma.user.count({ where: filters }),
    prisma.user.count({ where: { role: { not: "ADMIN" } } }),
    prisma.user.count({ where: { isActive: true, role: { not: "ADMIN" } } }),
    prisma.user.count({ where: { isActive: false, role: { not: "ADMIN" } } }),
    prisma.user.count({ where: { isPremium: true, role: { not: "ADMIN" } } })
  ]);

  const sanitizedUsers = users.map((user) => exclude(user, ['password']));

  const percent = (count) => totalUsers === 0 ? "0%" : `${((count / totalUsers) * 100).toFixed(2)}%`;

  return {
    stats: {
      total: totalUsers,
      active: activeUsers,
      inactive: inactiveUsers,
      premium: premiumUsers,
      percentages: {
        active: percent(activeUsers),
        inactive: percent(inactiveUsers),
        premium: percent(premiumUsers)
      }
    },
    pagination: {
      total: totalFiltered,
      page: parseInt(page),
      limit: take,
      totalPages: Math.ceil(totalFiltered / take)
    },
    users: sanitizedUsers
  };
};


const getStaff = async (query) => {
  const {
    page = 1,
    limit = 10,
    // Optional: true, false, or undefined
    isActive,
    search = "",
    allow,         // Optional: e.g., "Moderator" or "Administrator"
  } = query;

  const staffRole = 'MODERATOR';
  const take = parseInt(limit);
  const skip = (parseInt(page) - 1) * take;

  // Build dynamic filters
  const whereClause = {
    role: staffRole,
    roleId: { not: null },
    ...(typeof isActive === 'boolean' && { isActive }),
    ...(allow && {
      allow: {
        name: allow,
      },
    }),
    ...(search && {
      OR: [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
      ],
    }),
  };

  // Fetch total count (before pagination)
  const totalStaff = await prisma.user.count({
    where: whereClause,
  });

  // Fetch paginated staff
  const staffMembers = await prisma.user.findMany({
    where: whereClause,
    include: {
      allow: true,
    },
    orderBy: {
      allow: {
        name: 'asc',
      },
    },
    skip,
    take,
  });

  // Separate active and inactive from the filtered result
  const activeStaffCount = staffMembers.filter(user => user.isActive).length;
  const inactiveStaffCount = staffMembers.filter(user => !user.isActive).length;

  // Count by Alloweded.name within current page result
  const countByRoles = {};
  for (const user of staffMembers) {
    const allowName = user.allow?.name || 'Unknown';
    countByRoles[allowName] = (countByRoles[allowName] || 0) + 1;
  }

  return {
    page: parseInt(page),
    limit: take,
    totalStaff,
    activeStaffCount,
    inactiveStaffCount,
    countByRoles,
    staffMembers,
  };
};


const getDashboardStats = async () => {
  const now = new Date();
  const startOfYear = new Date(now.getFullYear(), 0, 1);
  const startOfToday = new Date();
  startOfToday.setHours(0, 0, 0, 0);
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  const [totalMembers, premiumMembers, freeMembers, todayMembers, usersByMonthRaw, todayRegisteredUsers] = await prisma.$transaction([
    prisma.user.count({
      where: { role: { not: 'ADMIN' } }
    }),
    prisma.user.count({
      where: { isPremium: true, role: { not: 'ADMIN' } }
    }),
    prisma.user.count({
      where: { isPremium: false, role: { not: 'ADMIN' } }
    }),
    prisma.user.count({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday },
        role: { not: 'ADMIN' }
      }
    }),
    prisma.user.groupBy({
      by: ['createdAt'],
      where: {
        createdAt: { gte: startOfYear },
        role: { not: 'ADMIN' }
      },
      _count: true
    }),
    prisma.user.findMany({
      where: {
        createdAt: { gte: startOfToday, lte: endOfToday },
        role: { not: 'ADMIN' }
      },
      orderBy: { createdAt: 'desc' },
    })
  ]);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const monthlyStats = Array(12).fill(0); // Jan - Dec

  usersByMonthRaw.forEach(({ createdAt, _count }) => {
    const monthIndex = new Date(createdAt).getMonth();
    monthlyStats[monthIndex] += _count;
  });
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const membersLastMonth = await prisma.user.count({
    where: {
      isDeleted: false,
      createdAt: {
        gte: firstDayLastMonth,
        lte: lastDayLastMonth
      }
    }
  });

  // Members added this month
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const membersThisMonth = await prisma.user.count({
    where: {
      isDeleted: false,
      createdAt: {
        gte: firstDayThisMonth
      }
    }
  });

  // Growth rate relative to last month
  let growthRateMessage;

  if (membersLastMonth === 0) {
    if (membersThisMonth > 0) {
      growthRateMessage = `${membersThisMonth} new members this month`;
    } else {
      growthRateMessage = "No members yet";
    }
  } else {
    const growthRate = ((membersThisMonth - membersLastMonth) / membersLastMonth) * 100;
    growthRateMessage = `${growthRate.toFixed(2)}% growth`;
  }


  return {
    membersLastMonth,
    membersThisMonth,
    growthRateMessage,
    totalMembers,
    premiumMembers,
    freeMembers,
    todayMembers,
    monthlyRegistrations: monthNames.map((name, idx) => ({
      month: name,
      count: monthlyStats[idx]
    })),
    todayRegisteredUsers: todayRegisteredUsers
  };
};





const updateUserById = async (userId, updateData) => {
  const user = await getUserById(userId);

  // Check if new email is already taken
  if (updateData.email && updateData.email !== user.email) {
    if (await prisma.user.findUnique({ where: { id: +userId, email: updateData.email } })) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Email already taken');
    }
  }

  // Check if new username is already taken
  if (updateData.username && updateData.username !== user.username) {
    if (await prisma.user.findUnique({ where: { id: +userId, username: updateData.username } })) {
      throw new ApiError(httpStatus.BAD_REQUEST, 'Username already taken');
    }
  }

  // Hash new password if provided
  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 8);
  }

  if (updateData.packageId) {
    const packageData = await prisma.package.findUnique({
      where: { id: updateData.packageId },
    });

    if (!packageData) {
      throw new ApiError(httpStatus.NOT_FOUND, 'Package not found');
    }

    const now = new Date();
    let packageStart = now;
    let packageEnd;

    // If current premium is still active, extend it
    if (user.isPremium && user.packageEnd && user.packageEnd > now) {
      packageEnd = new Date(user.packageEnd);
      packageEnd.setDate(packageEnd.getDate() + packageData.validity);
      packageStart = user.packageStart; // keep original start
    } else {
      // New premium period starts now
      packageEnd = new Date(now);
      packageEnd.setDate(packageEnd.getDate() + packageData.validity);
    }

    updateData.isPremium = true;
    updateData.packageStart = packageStart;
    updateData.packageEnd = packageEnd;
    const transactionId = crypto.randomUUID();

    await prisma.package.update({
      where: { id: updateData.packageId },
      data: { soldCount: { increment: 1 } },
    });
    await prisma.userPackage.create({
      data: {
        userId: user.id,
        packageId: packageData.id,
        purchaseDate: now,
        startDate: packageStart,
        endDate: packageEnd,
        priceAtPurchase: packageData.price,
        status: 'ACTIVE', // default
        transactionId: transactionId, // if coming from payment gateway
        notes: updateData.notes || null
      }
    });


    await  sendPackagePurchaseEmail({
      userId: user.id,
      packageId: packageData.id,
      startDate: packageStart,
      endDate: packageEnd,
      price: packageData.price,
    });
    delete updateData.packageId;
  }

  const updatedUser = await prisma.user.update({
    where: { id: parseInt(userId) },
    data: updateData
  });

  return exclude(updatedUser, ['password']);
};

const deleteUserById = async (userId) => {
  const user = await getUserById(userId); // Verify user exists
  if (!user) {
    throw new ApiError(httpStatus.OK, "User not found");
  }
  await sendAccountDeletionEmail({ userId });
  return await prisma.user.update({
    where: { id: parseInt(userId) },
    data: { isDeleted: true },
  });


};

// EducationCareer Services
const createEducationCareer = async (userId, data) => {
  await getUserById(userId); // Verify user exists
  return prisma.educationCareer.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getEducationCareerByUserId = async (userId) => {
  return prisma.educationCareer.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updateEducationCareerByUserId = async (userId, data) => {
  return prisma.educationCareer.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deleteEducationCareerByUserId = async (userId) => {
  return prisma.educationCareer.delete({
    where: { userId: parseInt(userId) }
  });
};

// PersonalityBehavior Services
const createPersonalityBehavior = async (userId, data) => {
  await getUserById(userId); // Verify user exists
  return prisma.personalityBehavior.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getPersonalityBehaviorByUserId = async (userId) => {
  return prisma.personalityBehavior.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updatePersonalityBehaviorByUserId = async (userId, data) => {
  return prisma.personalityBehavior.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deletePersonalityBehaviorByUserId = async (userId) => {
  return prisma.personalityBehavior.delete({
    where: { userId: parseInt(userId) }
  });
};

// PartnerExpectation Services
const createPartnerExpectation = async (userId, data) => {
  await getUserById(userId);
  return prisma.partnerExpectation.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getPartnerExpectationByUserId = async (userId) => {
  return prisma.partnerExpectation.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updatePartnerExpectationByUserId = async (userId, data) => {
  return prisma.partnerExpectation.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deletePartnerExpectationByUserId = async (userId) => {
  return prisma.partnerExpectation.delete({
    where: { userId: parseInt(userId) }
  });
};

// Lifestyle Services
const createLifestyle = async (userId, data) => {
  await getUserById(userId);
  return prisma.lifestyle.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getLifestyleByUserId = async (userId) => {
  return prisma.lifestyle.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updateLifestyleByUserId = async (userId, data) => {
  return prisma.lifestyle.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deleteLifestyleByUserId = async (userId) => {
  return prisma.lifestyle.delete({
    where: { userId: parseInt(userId) }
  });
};

// HobbiesInterests Services
const createHobbiesInterests = async (userId, data) => {
  await getUserById(userId);
  return prisma.hobbiesInterests.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getHobbiesInterestsByUserId = async (userId) => {
  return prisma.hobbiesInterests.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updateHobbiesInterestsByUserId = async (userId, data) => {
  return prisma.hobbiesInterests.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deleteHobbiesInterestsByUserId = async (userId) => {
  return prisma.hobbiesInterests.delete({
    where: { userId: parseInt(userId) }
  });
};

// LanguageInfo Services
const createLanguageInfo = async (userId, data) => {
  await getUserById(userId);
  return prisma.languageInfo.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getLanguageInfoByUserId = async (userId) => {
  return prisma.languageInfo.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updateLanguageInfoByUserId = async (userId, data) => {
  return prisma.languageInfo.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deleteLanguageInfoByUserId = async (userId) => {
  return prisma.languageInfo.delete({
    where: { userId: parseInt(userId) }
  });
};

// Living Services
const createLiving = async (userId, data) => {
  await getUserById(userId);
  const existingLiving = await prisma.living.findFirst({
    where: {
      userId: parseInt(userId),
    },
  });

  if (existingLiving) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Living is already created for this user");
  }
  return prisma.living.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getLivingByUserId = async (userId) => {
  return prisma.living.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updateLivingByUserId = async (userId, data) => {
  return prisma.living.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deleteLivingByUserId = async (userId) => {
  return prisma.living.delete({
    where: { userId: parseInt(userId) }
  });
};

// PhysicalAppearance Services
const createPhysicalAppearance = async (userId, data) => {
  await getUserById(userId);
  return prisma.physicalAppearance.create({
    data: {
      ...data,
      userId: parseInt(userId)
    }
  });
};

const getPhysicalAppearanceByUserId = async (userId) => {
  return prisma.physicalAppearance.findUnique({
    where: { userId: parseInt(userId) }
  });
};

const updatePhysicalAppearanceByUserId = async (userId, data) => {
  return prisma.physicalAppearance.update({
    where: { userId: parseInt(userId) },
    data
  });
};

const deletePhysicalAppearanceByUserId = async (userId) => {
  return prisma.physicalAppearance.delete({
    where: { userId: parseInt(userId) }
  });
};



const blockUser = async (blockerId, blockedUserId) => {
  if (blockerId === blockedUserId) throw new Error('You cannot block yourself.');
  const existingBlock = await prisma.block.findFirst({
    where: {
      blockerId,
      blockedId: blockedUserId,
    },
  });

  if (existingBlock) {
    return { message: "You have already blocked this user." };
  }
  await prisma.block.create({
    data: {
      blockerId,
      blockedId: blockedUserId,
    },
  });
  return { message: "You blocked this user." };

};

const unblockUser = async (blockerId, blockedUserId) => {
  return await prisma.block.deleteMany({
    where: {
      blockerId,
      blockedId: blockedUserId,
    },
  });
};

const getBlockedUsers = async (userId) => {
  const blocks = await prisma.block.findMany({
    where: { blockerId: userId },
    include: {
      blocked: {
        include: {
          PhotoSetting: true, // fetch PhotoSetting for each blocked user
        },
      },
    },
  });

  return blocks.map((entry) => entry.blocked);
};



const getPhotoSetting = async (userId) => {
  return await prisma.photoSetting.findUnique({
    where: { userId },
  });
};

const updatePhotoSetting = async (userId, data) => {
  const existing = await prisma.photoSetting.findUnique({ where: { userId } });

  if (existing) {
    return await prisma.photoSetting.update({
      where: { userId },
      data,
    });
  }

  return await prisma.photoSetting.create({
    data: { userId, ...data },
  });
};

const createTicket = async (userId, data) => {
  return await prisma.supportTicket.create({
    data: { userId, ...data },
  });
};

const getUserTickets = async (userId) => {
  return await prisma.supportTicket.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    include: {
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};

const updateTicketStatus = async (id, status) => {
  return await prisma.supportTicket.update({
    where: { id },
    data: { status },
  });
};

const addReplyToTicket = async (ticketId, senderId, message) => {
  return await prisma.supportTicketReply.create({
    data: {
      ticketId,
      senderId,
      message,
    },
  });
};

const getTicketWithReplies = async (ticketId) => {
  return await prisma.supportTicket.findUnique({
    where: { id: ticketId },
    include: {
      replies: {
        include: {
          sender: {
            select: {
              id: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};


const getAllTickets = async () => {
  return await prisma.supportTicket.findMany({
    orderBy: { createdAt: 'desc' },
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
      replies: {
        orderBy: { createdAt: 'asc' },
        include: {
          sender: {
            select: {
              id: true,
              role: true,
              firstName: true,
              lastName: true,
            },
          },
        },
      },
    },
  });
};

// Helper to calculate age from DOB
const calculateAge = (dob) => {
  if (!dob) return null;
  const today = new Date();
  const birthDate = new Date(dob);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
};

// Get blocked user IDs
// Get blocked user IDs
const getBlockedUserIds = async (userId) => {
  const blockedRecords = await prisma.block.findMany({
    where: {
      OR: [
        { blockerId: userId },
        { blockedId: userId }
      ]
    }
  });

  // Return a unique list of user IDs involved in a block with the user (excluding the userId itself)
  return [
    ...new Set(
      blockedRecords.flatMap(r => [r.blockerId, r.blockedId])
    )
  ].filter(id => id !== userId);
};


// Today's Top Matches
const getTodaysTopMatches = async (userId) => {
  // Get current user data with all needed relations
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      partnerExpectation: true,
      living: true,
      lifestyle: true,
      personalityBehavior: true,
      hobbiesInterests: true
    }
  });

  if (!currentUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get blocked users
  const blockedUserIds = await getBlockedUserIds(userId);

  // Build filter based on expectations
  const filters = {
    id: { notIn: [userId, ...blockedUserIds] },
    role: { not: 'ADMIN' }, // ✅ exclude admins
    isActive: true,
    AND: []
  };

  // Apply partner expectation filters
  if (currentUser.partnerExpectation) {
    const {
      ageFrom,
      ageTo,
      country,
      city,
      state,
      religion,
      origin,
      relationshipStatus,
      smoke,
      drinking,
      goingOut,
      lookingFor,
      length,
      education,
      weight,
    } = currentUser.partnerExpectation;

    // Age filter
    if (ageFrom !== null || ageTo !== null) {
      const today = new Date();
      filters.AND.push({
        dob: {
          lte: ageFrom ? new Date(today.getFullYear() - ageFrom, today.getMonth(), today.getDate()) : undefined,
          gte: ageTo ? new Date(today.getFullYear() - ageTo - 1, today.getMonth(), today.getDate()) : undefined
        }
      });
    }

    // Location filter
    if (country || city || state) {
      filters.AND.push({
        living: {
          ...(country && { country }),
          ...(city && { city }),
          ...(state && { state })
        }
      });
    }

    if (lookingFor) {
      filters.AND.push({
        gender: lookingFor
      });
    }

    // Categorical filters
    if (religion) filters.AND.push({ religion });
    if (origin) filters.AND.push({ origin });
    if (relationshipStatus) filters.AND.push({ relationshipStatus });

    // Lifestyle filters
    if (smoke !== undefined) {
      filters.AND.push({
        lifestyle: {
          smoke: smoke  // Convert boolean to expected string
        }
      });
    }

    if (education) {
      filters.AND.push({
        educationCareer: {
          OR: [
            { primarySpecialization: { contains: education } },
            { secondarySpecialization: { contains: education } },
            { qualifications: { contains: education } },
            { education: { contains: education } }
          ]
        }
      });
    }

    if (weight) {
      // Handle weight as string (since model defines it as String)
      filters.AND.push({
        physicalAppearance: {
          weight: { contains: weight }
        }
      });
    }
    if (length) {
      // Handle different height formats (e.g., "5'8", "170cm", "tall", "average")
      if (length.includes("'") || length.includes("cm")) {
        // Exact height match for specific measurements
        filters.AND.push({
          physicalAppearance: {
            height: { equals: length }
          }
        });
      } else {
        // Descriptive height match (tall, short, average)
        filters.AND.push({
          physicalAppearance: {
            height: { contains: length }
          }
        });
      }
    }
    if (drinking !== undefined) {
      filters.AND.push({
        lifestyle: {
          drinking: drinking // Convert boolean to expected string
        }
      });
    }

    if (goingOut !== undefined) {
      filters.AND.push({
        lifestyle: {
          goingOut: goingOut  // Convert boolean to expected string
        }
      });
    }
  }

  // Find matching users
  const matches = await prisma.user.findMany({
    where: filters,
    include: {
      living: true,
      physicalAppearance: true,
      hobbiesInterests: true,
      lifestyle: true,
      PhotoSetting: true,
      partnerExpectation: true,
      personalityBehavior: true
    },
    take: 10
  });

  // Add calculated ages
  return matches.map(user => ({
    ...user,
    age: calculateAge(user.dob)
  }));
};

// You May Also Like
const getYouMayAlsoLike = async (userId) => {
  // Get current user data
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      personalityBehavior: true,
      hobbiesInterests: true,
      lifestyle: true,
      educationCareer: true,
      living: true
    }
  });

  if (!currentUser) {
    throw new ApiError(httpStatus.NOT_FOUND, 'User not found');
  }

  // Get blocked users
  const blockedUserIds = await getBlockedUserIds(userId);

  // Build similarity conditions
  const similarityConditions = [];

  // Personality traits
  if (currentUser.personalityBehavior) {
    const personalityTraits = Object.entries(currentUser.personalityBehavior)
      .filter(([key, value]) => value === true && key !== 'id' && key !== 'userId')
      .map(([key]) => ({ personalityBehavior: { [key]: true } }));

    if (personalityTraits.length > 0) {
      similarityConditions.push(...personalityTraits);
    }
  }

  // Hobbies and interests
  if (currentUser.hobbiesInterests) {
    ['sports', 'music', 'kitchen', 'reading', 'tvShows'].forEach(key => {
      if (currentUser.hobbiesInterests[key]) {
        const values = currentUser.hobbiesInterests[key].split(',');
        values.slice(0, 2).forEach(value => {
          if (value.trim()) {
            similarityConditions.push({
              hobbiesInterests: {
                [key]: { contains: value.trim() }
              }
            });
          }
        });
      }
    });
  }

  // Lifestyle factors
  if (currentUser.lifestyle) {
    ['exercise', 'diet', 'pets', 'travel', 'workLifeBalance'].forEach(key => {
      if (currentUser.lifestyle[key]) {
        similarityConditions.push({
          lifestyle: { [key]: currentUser.lifestyle[key] }
        });
      }
    });
  }

  // Location similarity
  if (currentUser.living) {
    ['country', 'state', 'city'].forEach(key => {
      if (currentUser.living[key]) {
        similarityConditions.push({
          living: { [key]: currentUser.living[key] }
        });
      }
    });
  }

  // Education/career similarity
  if (currentUser.educationCareer?.primarySpecialization) {
    similarityConditions.push({
      educationCareer: {
        primarySpecialization: {
          contains: currentUser.educationCareer.primarySpecialization.split(' ')[0]
        }
      }
    });
  }

  // Find similar profiles
  const suggestions = await prisma.user.findMany({
    where: {
      id: { notIn: [userId, ...blockedUserIds] },
      role: { not: 'ADMIN' }, // ✅ exclude admins
      isActive: true,
      OR: similarityConditions.length > 0 ? similarityConditions : undefined
    },
    include: {
      personalityBehavior: true,
      hobbiesInterests: true,
      lifestyle: true,
      PhotoSetting: true
    },
    take: 10
  });

  // Add calculated ages
  return suggestions.map(user => ({
    ...user,
    age: calculateAge(user.dob)
  }));
};



// Helper to calculate age fro
const calculateMatchScore = (currentUser, targetUser) => {
  let score = 0;

  // 1. Core expectations (30%)
  if (currentUser.partnerExpectation) {
    const expectationKeys = ['religion', 'origin', 'relationshipStatus'];
    const matches = expectationKeys.filter(k =>
      currentUser.partnerExpectation[k] === targetUser[k]
    ).length;
    score += (matches / expectationKeys.length) * 30;
  }

  // 2. Lifestyle compatibility (25%)
  if (currentUser.lifestyle && targetUser.lifestyle) {
    const lifestyleKeys = ['smoke', 'drinking', 'goingOut'];
    const matches = lifestyleKeys.filter(k =>
      currentUser.lifestyle[k] === targetUser.lifestyle[k]
    ).length;
    score += (matches / lifestyleKeys.length) * 25;
  }

  // 3. Personality alignment (20%)
  if (currentUser.personalityBehavior && targetUser.personalityBehavior) {
    const personalityKeys = Object.keys(currentUser.personalityBehavior)
      .filter(k => k !== 'id' && k !== 'userId');

    const matches = personalityKeys.filter(k =>
      currentUser.personalityBehavior[k] === targetUser.personalityBehavior[k]
    ).length;

    score += (matches / personalityKeys.length) * 20;
  }

  // 4. Interests overlap (15%)
  if (currentUser.hobbiesInterests && targetUser.hobbiesInterests) {
    const hobbyKeys = ['sports', 'music', 'kitchen', 'reading', 'tvShows'];
    const matches = hobbyKeys.filter(k => {
      const current = currentUser.hobbiesInterests[k]?.split(',') || [];
      const target = targetUser.hobbiesInterests[k]?.split(',') || [];
      return current.some(val => target.includes(val));
    }).length;

    score += (matches / hobbyKeys.length) * 15;
  }

  // 5. Location proximity (10%)
  if (currentUser.living && targetUser.living) {
    if (currentUser.living.country === targetUser.living.country) {
      score += 5;
      if (currentUser.living.state === targetUser.living.state) {
        score += 3;
        if (currentUser.living.city === targetUser.living.city) {
          score += 2;
        }
      }
    }
  }

  return Math.min(Math.round(score), 100);
};

const searchUsers = async (userId, filters) => {
  const {
    gender,
    relationshipStatus,
    country,
    state,
    city,
    religion,
    education,
    minAge,
    maxAge,
    hasChildren,
    page = 1,
    limit = 10
  } = filters;

  // Get blocked users
  const blockedUserIds = await getBlockedUserIds(userId);

  // Calculate birthdate range (fixed the min/max age calculation)
  const today = new Date();
  const minBirthdate = maxAge
    ? new Date(today.getFullYear() - maxAge - 1, today.getMonth(), today.getDate())
    : undefined;
  const maxBirthdate = minAge
    ? new Date(today.getFullYear() - minAge, today.getMonth(), today.getDate())
    : undefined;

  // Build the where clause
  const whereClause = {
    id: { notIn: [userId, ...blockedUserIds] },
    isActive: true,
    AND: []
  };

  // Gender filter
  if (gender) {
    whereClause.AND.push({ gender: { equals: gender } });
  }

  // Relationship status filter
  if (relationshipStatus) {
    whereClause.AND.push({
      relationshipStatus: {
        equals: relationshipStatus,
      }
    });
  }

  // Location filters - now using AND instead of OR for more precise matching
  if (country || state || city) {
    const locationConditions = {};
    if (country) locationConditions.country = { contains: country };
    if (state) locationConditions.state = { contains: state };
    if (city) locationConditions.city = { contains: city };

    whereClause.AND.push({ living: locationConditions });
  }

  // Religion filter
  if (religion) {
    whereClause.AND.push({
      religion: {
        contains: religion,
      }
    });
  }

  // Education filter - expanded to include more fields
  if (education) {
    whereClause.AND.push({
      educationCareer: {
        OR: [
          { primarySpecialization: { contains: education } },
          { secondarySpecialization: { contains: education } },
          { qualifications: { contains: education } },
          { education: { contains: education } },
          { certifications: { contains: education } }
        ]
      }
    });
  }

  // Age range filter - fixed the min/max logic
  if (minBirthdate || maxBirthdate) {
    const dobCondition = {};
    if (minBirthdate) dobCondition.gte = minBirthdate;
    if (maxBirthdate) dobCondition.lte = maxBirthdate;
    whereClause.AND.push({ dob: dobCondition });
  }

  // Children filter
  if (hasChildren !== undefined) {
    whereClause.AND.push({ children: hasChildren });
  }




  // Calculate pagination
  const skip = (page - 1) * limit;
  const total = await prisma.user.count({ where: whereClause });

  // Execute search with more comprehensive includes
  const results = await prisma.user.findMany({
    where: whereClause,
    include: {
      living: true,
      educationCareer: true,
      lifestyle: true,
      PhotoSetting: true,
      physicalAppearance: true,
      hobbiesInterests: true,
      personalityBehavior: true
    },
    skip,
    take: parseInt(limit),
    orderBy: { createdAt: 'desc' }
  });

  // Add calculated ages and match score
  const currentUser = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      partnerExpectation: true,
      personalityBehavior: true
    }
  });

  const usersWithAgeAndScore = results.map(user => ({
    ...user,
    age: calculateAge(user.dob),
    matchScore: currentUser ? calculateMatchScore(currentUser, user) : 0
  })).sort((a, b) => b.matchScore - a.matchScore);

  return {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / limit),
    results: usersWithAgeAndScore
  };
};



const createLike = async (senderId, receiverId) => {
  return prisma.like.create({
    data: {
      senderId,
      receiverId,
      status: 'PENDING'
    },
    include: {
      sender: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true
        }
      }
    }
  });
};

const getLikeById = async (likeId) => {
  return prisma.like.findUnique({
    where: { id: +likeId },
    include: {
      sender: true,
      receiver: true
    }
  });
};

const getLikeBetweenUsers = async (senderId, receiverId) => {
  return prisma.like.findFirst({
    where: {
      senderId,
      receiverId
    }
  });
};

const acceptLike = async (likeId) => {
  return prisma.like.update({
    where: { id: +likeId },
    data: { status: 'ACCEPTED' }
  });
};

const declineLike = async (likeId) => {
  return prisma.like.update({
    where: { id: +likeId },
    data: { status: 'DECLINED' }
  });
};

const getAcceptedLikes = async (userId) => {
  return prisma.like.findMany({
    where: {
      senderId: userId,
      status: 'ACCEPTED'
    },
    include: {
      receiver: true,
      sender: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
};

const getSentLikes = async (userId) => {
  return prisma.like.findMany({
    where: {
      senderId: userId,
    },
    include: {
      receiver: true,
      sender: true
    },
    orderBy: {
      updatedAt: 'desc'
    }
  });
};
const getLikesReceived = async (userId, status) => {
  const where = { receiverId: userId };
  if (status) {
    where.status = status;
  }

  return prisma.like.findMany({
    where,
    include: {
      sender: true,
      receiver: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });
};

const createConnection = async (user1Id, user2Id) => {
  // Ensure consistent ordering to prevent duplicate connections
  const [id1, id2] = [user1Id, user2Id].sort((a, b) => a - b);

  return prisma.connection.create({
    data: {
      user1Id: id1,
      user2Id: id2
    }
  });
};

const checkConnection = async (user1Id, user2Id) => {
  const [id1, id2] = [user1Id, user2Id].sort((a, b) => a - b);

  return prisma.connection.findFirst({
    where: {
      user1Id: id1,
      user2Id: id2
    }
  });
};

const canUsersMessage = async (user1Id, user2Id) => {
  const users = await prisma.user.findMany({
    where: {
      id: { in: [user1Id, user2Id] }
    },
    select: {
      id: true,
      role: true
    }
  });

  // At least one user must be VIP
  return users.some(user => user.isPremium === 'true');
};

const getUserPhotoSettings = async (userId) => {
  return prisma.photoSetting.findUnique({
    where: { userId }
  });
};

const canViewPhotos = async (targetId, requesterId) => {
  if (targetId === requesterId) return true;

  const targetSettings = await prisma.photoSetting.findUnique({
    where: { userId: targetId }
  });

  if (!targetSettings) return true; // No restrictions if no settings exist

  // Check different access rules
  if (targetSettings.onRequestOnly) {
    const approvedRequest = await prisma.photoRequest.findFirst({
      where: {
        requesterId,
        targetId,
        status: 'APPROVED'
      }
    });
    return !!approvedRequest;
  }

  if (targetSettings.onlyVipCanSee) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true }
    });
    return requester?.role === 'VIP';
  }

  if (targetSettings.onlyMembersWithPhotoCanSee) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { image: true }
    });
    return !!requester?.image;
  }

  return true;
};

const getUserPhotos = async (userId, requesterId) => {
  const canView = await this.canViewPhotos(userId, requesterId);
  if (!canView) return [];

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: {
      image: true,
      // Add other photo fields if you have them
      photoSetting: true
    }
  });

  // Apply blur if needed
  if (user.photoSetting?.blurForFreeMembers) {
    const requester = await prisma.user.findUnique({
      where: { id: requesterId },
      select: { role: true }
    });

    if (requester?.role !== 'VIP') {
      return {
        ...user,
        image: user.image ? 'blurred-placeholder.jpg' : null
      };
    }
  }

  return user;
};

const createPhotoRequest = async (requesterId, targetId) => {
  return prisma.photoRequest.create({
    data: {
      requesterId,
      targetId,
      status: 'PENDING'
    },
    include: {
      requester: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          image: true
        }
      }
    }
  });
};

const getPhotoRequest = async (requesterId, targetId) => {
  return prisma.photoRequest.findFirst({
    where: {
      requesterId,
      targetId
    }
  });
};

const getPhotoRequestById = async (requestId) => {
  return prisma.photoRequest.findUnique({
    where: { id: requestId },
    include: {
      requester: true,
      target: true
    }
  });
};

const approvePhotoRequest = async (requestId) => {
  return prisma.photoRequest.update({
    where: { id: requestId },
    data: { status: 'APPROVED' }
  });
};

const denyPhotoRequest = async (requestId) => {
  return prisma.photoRequest.update({
    where: { id: requestId },
    data: { status: 'DENIED' }
  });
};

// const getPhotoRequests = async (userId, type, status) => {
//   const where = {};

//   if (type === 'received') {
//     where.targetId = userId;
//   } else if (type === 'sent') {
//     where.requesterId = userId;
//   }

//   if (status) {
//     where.status = status;
//   }

//   return prisma.photoRequest.findMany({
//     where,
//     include: {
//       requester: true,
//       target: true
//     },
//     orderBy: {
//       createdAt: 'desc'
//     }
//   });
// };
const getPhotoRequests = async (userId, type, status) => {
  const where = {};

  if (type === 'received') {
    where.targetId = userId;
  } else if (type === 'sent') {
    where.requesterId = userId;
  }

  if (status) {
    where.status = status;
  }

  const requests = await prisma.photoRequest.findMany({
    where,
    include: {
      requester: true,
      target: true
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  // Map requester → sender, target → receiver
  return requests.map(req => ({
    ...req,
    sender: req.requester,
    receiver: req.target,
    requester: undefined,
    target: undefined
  }));
};



const createRole = async (roleBody) => {
  const { name, description, isDefault, permissions } = roleBody;

  // Check if role already exists
  const existingRole = await prisma.alloweded.findUnique({ where: { name } });
  if (existingRole) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Role already exists");
  }

  // Create role with nested permissions
  const role = await prisma.alloweded.create({
    data: {
      name,
      description,
      isDefault,
      permissions: {
        create: permissions
      }
    },
    include: {
      permissions: true
    }
  });

  return role;
};



const getRoles = async () => {
  return prisma.alloweded.findMany({ include: { permissions: true } });
};

const getRoleById = async (id) => {
  const role = await prisma.alloweded.findUnique({
    where: { id },
    include: { permissions: true }
  });
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role not found");
  return role;
};

const updateRole = async (id, data) => {
  const role = await prisma.alloweded.findUnique({ where: { id } });
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role not found");

  const { permissions, ...rest } = data;

  if (permissions) {
    // Delete old permissions and recreate
    await prisma.permission.deleteMany({ where: { roleId: id } });
    await prisma.permission.createMany({
      data: permissions.map(p => ({ ...p, roleId: id }))
    });
  }

  return prisma.alloweded.update({
    where: { id },
    data: rest,
    include: { permissions: true }
  });
};

const deleteRole = async (id) => {
  const role = await prisma.alloweded.findUnique({ where: { id } });
  if (!role) throw new ApiError(httpStatus.NOT_FOUND, "Role not found");

  await prisma.permission.deleteMany({ where: { roleId: id } });
  await prisma.alloweded.delete({ where: { id } });
};


const getUserReport = async ({
  startDate,
  endDate,
  relationshipStatus,
  country
}) => {
  // Base filter for all queries
  const whereFilter = {
    isDeleted: false,
    ...(relationshipStatus ? { relationshipStatus } : {}),
    ...(startDate && endDate
      ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
      : {})
  };

  if (country) {
    whereFilter.living = { country };
  }

  // All-time logins
  const totalLogins = await prisma.user.count({
    where: {
      ...whereFilter,
      lastLogin: { not: null }
    }
  });

  // Completed profiles: PartnerExpectation exists
  const completedProfiles = await prisma.user.count({
    where: {
      ...whereFilter,
      route: "/auth/profile/partner-preferences"
    }
  });

  // Deleted profiles
  const deletedProfiles = await prisma.user.count({
    where: { ...whereFilter, isDeleted: true }
  });

  // Never logged in
  const neverLoggedIn = await prisma.user.count({
    where: { ...whereFilter, lastLogin: null }
  });

  // Relationship status breakdown (percentages)
  const relationshipGroup = await prisma.user.groupBy({
    by: ["relationshipStatus"],
    _count: { relationshipStatus: true },
    where: {
      ...whereFilter,
      relationshipStatus: { not: null }
    }
  });

  const totalWithRelationshipStatus = relationshipGroup.reduce(
    (sum, r) => sum + r._count.relationshipStatus,
    0
  );

  const relationshipPercentages = relationshipGroup.map(r => ({
    status: r.relationshipStatus,
    count: r._count.relationshipStatus,
    percentage: ((r._count.relationshipStatus / totalWithRelationshipStatus) * 100).toFixed(2)
  }));

  // Top 5 origins
  const originGroup = await prisma.user.groupBy({
    by: ["origin"],
    _count: { origin: true },
    where: { ...whereFilter, origin: { not: null } }
  });

  const top5Origins = originGroup
    .sort((a, b) => b._count.origin - a._count.origin)
    .slice(0, 5);

  // Religion breakdown
  const religionGroup = await prisma.user.groupBy({
    by: ["religion"],
    _count: { religion: true },
    where: { ...whereFilter, religion: { not: null } }
  });

  // Career breakdown (EducationCareer table)
  const careerGroup = await prisma.educationCareer.groupBy({
    by: ["primarySpecialization"],
    _count: { primarySpecialization: true },
    where: {
      user: whereFilter
    }
  });

  // Last 10 registered accounts
  const lastTenAccounts = await prisma.user.findMany({
    where: whereFilter,
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    filters: { startDate, endDate, relationshipStatus, country },
    totalLogins,
    completedProfiles,
    deletedProfiles,
    neverLoggedIn,
    relationshipPercentages,
    top5Origins,
    religionGroup,
    careerGroup,
    lastTenAccounts
  };
}

const getMemberReport = async ({ startDate, endDate, relationshipStatus, country }) => {
  // Same filter base
  const whereFilter = {
    ...(relationshipStatus ? { relationshipStatus } : {}),
    ...(startDate && endDate
      ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
      : {})
  };

  if (country) {
    whereFilter.living = { country };
  }

  // Total members (non-deleted)
  const totalMembers = await prisma.user.count({
    where: { ...whereFilter, isDeleted: false }
  });

  // Members added last month
  const now = new Date();
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);

  const membersLastMonth = await prisma.user.count({
    where: {
      ...whereFilter,
      isDeleted: false,
      createdAt: {
        gte: firstDayLastMonth,
        lte: lastDayLastMonth
      }
    }
  });

  // Members added this month
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const membersThisMonth = await prisma.user.count({
    where: {
      ...whereFilter,
      isDeleted: false,
      createdAt: {
        gte: firstDayThisMonth
      }
    }
  });

  // Growth rate relative to last month
  let growthRate = 0;
  if (membersLastMonth > 0) {
    growthRate = ((membersThisMonth - membersLastMonth) / membersLastMonth) * 100;
  }

  // Active members (isActive = true, not deleted)
  const activeMembers = await prisma.user.count({
    where: { ...whereFilter, isDeleted: false, isActive: true }
  });

  // Members by role (replace roleId with Alloweded.name if moderator)
  const roleGroup = await prisma.user.groupBy({
    by: ["role", "roleId"],
    _count: { role: true },
    where: { ...whereFilter, isDeleted: false }
  });

  const rolesWithNames = await Promise.all(
    roleGroup.map(async (r) => {
      let roleName = r.role;
      if (r.role === "MODERATOR" && r.roleId) {
        const allowededRole = await prisma.alloweded.findUnique({
          where: { id: r.roleId }
        });
        if (allowededRole) {
          roleName = allowededRole.name;
        }
      }
      return {
        role: roleName,
        count: r._count.role
      };
    })
  );

  // Status breakdown
  const statusBreakdown = {
    active: await prisma.user.count({ where: { ...whereFilter, isActive: true } }),
    inactive: await prisma.user.count({ where: { ...whereFilter, isActive: false } }),
    deleted: await prisma.user.count({ where: { ...whereFilter, isDeleted: true } })
  };

  // Last 10 registered members
  const lastTenMembers = await prisma.user.findMany({
    where: whereFilter,
    orderBy: { createdAt: "desc" },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      email: true,
      createdAt: true,
      role: true,
      isActive: true,
      isDeleted: true
    }
  });

  return {
    filters: { startDate, endDate, relationshipStatus, country },
    totalMembers,
    membersLastMonth,
    membersThisMonth,
    growthRate: `${growthRate.toFixed(2)}%`,
    activeMembers,
    rolesWithNames,
    statusBreakdown,
    lastTenMembers
  };
}

const getAnalyticsReport = async ({ startDate, endDate, relationshipStatus, country }) => {
  // Base filter
  const whereFilter = {
    ...(relationshipStatus ? { relationshipStatus } : {}),
    ...(startDate && endDate
      ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
      : {})
  };

  if (country) {
    whereFilter.living = { country };
  }

  const now = new Date();
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  // Total users (filtered)
  const totalUsers = await prisma.user.count({ where: { ...whereFilter, isDeleted: false } });

  // Total users last month (for percentage change)
  const totalUsersLastMonth = await prisma.user.count({
    where: {
      ...whereFilter,
      isDeleted: false,
      createdAt: { lte: firstDayThisMonth }
    }
  });

  let userGrowthRate = 0;
  if (totalUsersLastMonth > 0) {
    userGrowthRate = ((totalUsers - totalUsersLastMonth) / totalUsersLastMonth) * 100;
  }

  // New signups (this month)
  const newSignups = await prisma.user.count({
    where: {
      ...whereFilter,
      isDeleted: false,
      createdAt: { gte: firstDayThisMonth }
    }
  });

  // Matches made (Connections table)
  const totalMatches = await prisma.connection.count({
    where: startDate && endDate
      ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
      : {}
  });

  // Messages sent
  const totalMessages = await prisma.message.count({
    where: startDate && endDate
      ? { createdAt: { gte: new Date(startDate), lte: new Date(endDate) } }
      : {}
  });

  // Gender distribution
  const genderGroup = await prisma.user.groupBy({
    by: ["gender"],
    _count: { gender: true },
    where: { ...whereFilter, gender: { not: null } }
  });

  const totalWithGender = genderGroup.reduce((sum, g) => sum + g._count.gender, 0);
  const genderDistribution = genderGroup.map(g => ({
    gender: g.gender,
    count: g._count.gender,
    percentage: ((g._count.gender / totalWithGender) * 100).toFixed(2)
  }));

  // Average age distribution in percentage
  const ageGroup = await prisma.user.groupBy({
    by: ["age"],
    _count: { age: true },
    where: { ...whereFilter, age: { not: null } }
  });

  const totalWithAge = ageGroup.reduce((sum, a) => sum + a._count.age, 0);
  const ageDistribution = ageGroup.map(a => ({
    age: a.age,
    count: a._count.age,
    percentage: ((a._count.age / totalWithAge) * 100).toFixed(2)
  }));

  // Country distribution
  const countryGroup = await prisma.living.groupBy({
    by: ["country"],
    _count: { country: true },
    where: { user: whereFilter }
  });

  const totalCountriesCount = countryGroup.reduce((sum, c) => sum + c._count.country, 0);
  const countryDistribution = countryGroup.map(c => ({
    country: c.country,
    count: c._count.country,
    percentage: ((c._count.country / totalCountriesCount) * 100).toFixed(2)
  }));

  // Top cities
  const cityGroup = await prisma.living.groupBy({
    by: ["city"],
    _count: { city: true },
    where: { user: whereFilter }
  });

  const topCities = cityGroup
    .sort((a, b) => b._count.city - a._count.city)
    .slice(0, 5);

  // Pages and their views (assumes "views" field exists in Page)
  let pagesViews = [];
  try {
    // Get all active pages


    // Get view counts from PageView table
    const viewsData = await prisma.pageView.findMany({
      select: { pageLink: true, count: true }
    });
    console.log(viewsData)
    pagesViews = viewsData
  } catch (err) {
    pagesViews = [];
  }

  return {
    filters: { startDate, endDate, relationshipStatus, country },
    totalUsers,
    userGrowthRate: `${userGrowthRate.toFixed(2)}%`,
    newSignups,
    totalMatches,
    totalMessages,
    genderDistribution,
    ageDistribution,
    countryDistribution,
    topCities,
    pagesViews
  };
}
// const getPackageReportService = async () => {
//   const now = new Date();
//   const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
//   const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
//   const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
//   const startOfThisYear = new Date(now.getFullYear(), 0, 1);
//   const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
//   const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

//   const totalPayments = await prisma.userPackage.aggregate({
//     _sum: { priceAtPurchase: true }
//   });

//   const activePackages = await prisma.userPackage.count({
//     where: { status: "ACTIVE" }
//   });

//   const thisMonthPayments = await prisma.userPackage.aggregate({
//     _sum: { priceAtPurchase: true },
//     where: { purchaseDate: { gte: startOfThisMonth } }
//   });

//   const lastMonthPayments = await prisma.userPackage.aggregate({
//     _sum: { priceAtPurchase: true },
//     where: {
//       purchaseDate: {
//         gte: startOfLastMonth,
//         lte: endOfLastMonth
//       }
//     }
//   });

//   const thisYearPayments = await prisma.userPackage.aggregate({
//     _sum: { priceAtPurchase: true },
//     where: { purchaseDate: { gte: startOfThisYear } }
//   });

//   const lastYearPayments = await prisma.userPackage.aggregate({
//     _sum: { priceAtPurchase: true },
//     where: {
//       purchaseDate: {
//         gte: startOfLastYear,
//         lte: endOfLastYear
//       }
//     }
//   });

//   const lastTenUserPackages = await prisma.userPackage.findMany({
//     orderBy: { purchaseDate: "desc" },
//     take: 10,
//     include: {
//       user: { select: { id: true, firstName: true, lastName: true, email: true } },
//       package: { select: { id: true, name: true, price: true } }
//     }
//   });

//   return {
//     totalPayments: totalPayments._sum.priceAtPurchase || 0,
//     activePackages,
//     thisMonthPayments: thisMonthPayments._sum.priceAtPurchase || 0,
//     lastMonthPayments: lastMonthPayments._sum.priceAtPurchase || 0,
//     thisYearPayments: thisYearPayments._sum.priceAtPurchase || 0,
//     lastYearPayments: lastYearPayments._sum.priceAtPurchase || 0,
//     lastTenUserPackages
//   };
// };
const getPackageReportService = async (filters = {}) => {
  const now = new Date();
  const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);
  const startOfThisYear = new Date(now.getFullYear(), 0, 1);
  const startOfLastYear = new Date(now.getFullYear() - 1, 0, 1);
  const endOfLastYear = new Date(now.getFullYear() - 1, 11, 31);

  // Build where clause from filters
  let whereClause = {};
  if (filters.startDate || filters.endDate) {
    whereClause.purchaseDate = {};
    if (filters.startDate) whereClause.purchaseDate.gte = new Date(filters.startDate);
    if (filters.endDate) whereClause.purchaseDate.lte = new Date(filters.endDate);
  }
  if (filters.status) whereClause.status = filters.status;
  if (filters.packageId) whereClause.packageId = +filters.packageId;
  if (filters.gender) {
    whereClause.user = { gender: filters.gender };
  }

  // Total payments
  const totalPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true },
    where: whereClause
  });

  // Active packages
  const activePackages = await prisma.userPackage.count({
    where: { ...whereClause, status: "ACTIVE" }
  });

  // Monthly/yearly aggregates
  const thisMonthPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true },
    where: { ...whereClause, purchaseDate: { gte: startOfThisMonth } }
  });

  const lastMonthPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true },
    where: {
      ...whereClause,
      purchaseDate: { gte: startOfLastMonth, lte: endOfLastMonth }
    }
  });

  const thisYearPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true },
    where: { ...whereClause, purchaseDate: { gte: startOfThisYear } }
  });

  const lastYearPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true },
    where: {
      ...whereClause,
      purchaseDate: { gte: startOfLastYear, lte: endOfLastYear }
    }
  });

  // Difference from last year (%)
  let yearDifferencePercent = null;
  if (lastYearPayments._sum.priceAtPurchase > 0) {
    yearDifferencePercent =
      ((thisYearPayments._sum.priceAtPurchase - lastYearPayments._sum.priceAtPurchase) /
        lastYearPayments._sum.priceAtPurchase) *
      100;
  }

  // Revenue by gender
  const revenueByGender = await prisma.userPackage.groupBy({
    by: ["userId"],
    _sum: { priceAtPurchase: true },
    where: whereClause
  });

  const genderRevenueMap = {};
  for (let record of revenueByGender) {
    const user = await prisma.user.findUnique({
      where: { id: record.userId },
      select: { gender: true }
    });
    const gender = user?.gender || "Unknown";
    genderRevenueMap[gender] = (genderRevenueMap[gender] || 0) + (record._sum.priceAtPurchase || 0);
  }

  // Monthly revenue of this year
  const monthlyRevenue = [];
  for (let m = 0; m < 12; m++) {
    const monthStart = new Date(now.getFullYear(), m, 1);
    const monthEnd = new Date(now.getFullYear(), m + 1, 0);
    const monthData = await prisma.userPackage.aggregate({
      _sum: { priceAtPurchase: true },
      where: {
        ...whereClause,
        purchaseDate: { gte: monthStart, lte: monthEnd }
      }
    });
    monthlyRevenue.push({
      month: monthStart.toLocaleString("default", { month: "short" }),
      revenue: monthData._sum.priceAtPurchase || 0
    });
  }

  // Last 10 purchases
  const lastTenUserPackages = await prisma.userPackage.findMany({
    where: whereClause,
    orderBy: { purchaseDate: "desc" },
    take: 10,
    include: {
      user: { select: { id: true, firstName: true, lastName: true, email: true, gender: true, image: true } },
      package: { select: { id: true, name: true, price: true } }
    }
  });

  return {
    totalPayments: totalPayments._sum.priceAtPurchase || 0,
    activePackages,
    thisMonthPayments: thisMonthPayments._sum.priceAtPurchase || 0,
    lastMonthPayments: lastMonthPayments._sum.priceAtPurchase || 0,
    thisYearPayments: thisYearPayments._sum.priceAtPurchase || 0,
    lastYearPayments: lastYearPayments._sum.priceAtPurchase || 0,
    yearDifferencePercent,
    revenueByGender: genderRevenueMap,
    monthlyRevenue,
    lastTenUserPackages
  };
};


const getCombinedReportService = async () => {
  const now = new Date();
  const firstDayThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const firstDayLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const lastDayLastMonth = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59, 999);
  const startOfThisYear = new Date(now.getFullYear(), 0, 1);

  // =========================
  // USER REPORT SECTION
  // =========================
  const dailyLogins = await prisma.user.count({
    where: { lastLogin: { not: null } }
  });

  const completedProfiles = await prisma.user.count({
    where: { route: "/auth/profile/partner-preferences" }
  });

  const deletedAccounts = await prisma.user.count({
    where: { isDeleted: true }
  });

  const neverLoggedIn = await prisma.user.count({
    where: { lastLogin: null }
  });

  // =========================
  // PACKAGE REPORT SECTION
  // =========================
  const totalPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true }
  });

  const activePackages = await prisma.userPackage.count({
    where: { status: "ACTIVE" }
  });

  const thisMonthPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true },
    where: { purchaseDate: { gte: firstDayThisMonth } }
  });

  const thisYearPayments = await prisma.userPackage.aggregate({
    _sum: { priceAtPurchase: true },
    where: { purchaseDate: { gte: startOfThisYear } }
  });

  const revenueByGenderRaw = await prisma.userPackage.groupBy({
    by: ["userId"],
    _sum: { priceAtPurchase: true }
  });

  const revenueByGender = {};
  for (let record of revenueByGenderRaw) {
    const user = await prisma.user.findUnique({
      where: { id: record.userId },
      select: { gender: true }
    });
    const gender = user?.gender || "Unknown";
    revenueByGender[gender] =
      (revenueByGender[gender] || 0) + (record._sum.priceAtPurchase || 0);
  }

  // =========================
  // MEMBER REPORT SECTION
  // =========================
  const totalMembers = await prisma.user.count({
    where: { isDeleted: false }
  });

  const membersLastMonth = await prisma.user.count({
    where: {
      isDeleted: false,
      createdAt: { gte: firstDayLastMonth, lte: lastDayLastMonth }
    }
  });

  const membersThisMonth = await prisma.user.count({
    where: { isDeleted: false, createdAt: { gte: firstDayThisMonth } }
  });

  const activeMembers = await prisma.user.count({
    where: { isDeleted: false, isActive: true }
  });

  // =========================
  // ANALYTICS REPORT SECTION
  // =========================
  const totalUsers = await prisma.user.count({
    where: { isDeleted: false }
  });

  const newSignups = await prisma.user.count({
    where: { isDeleted: false, createdAt: { gte: firstDayThisMonth } }
  });

  const totalMatches = await prisma.connection.count();

  const totalMessages = await prisma.message.count();

  // =========================
  // FINAL COMBINED REPORT
  // =========================
  return {
    userReport: {
      dailyLogins,
      completedProfiles,
      deletedAccounts,
      neverLoggedIn
    },
    packageReport: {
      totalRevenue: totalPayments._sum.priceAtPurchase || 0,
      activePackages,
      thisMonthRevenue: thisMonthPayments._sum.priceAtPurchase || 0,
      thisYearRevenue: thisYearPayments._sum.priceAtPurchase || 0,
      revenueByGender
    },
    memberReport: {
      totalMembers,
      activeMembers,
      membersLastMonth,
      membersThisMonth
    },
    analyticsReport: {
      totalUsers,
      newSignups,
      totalMatches,
      totalMessages
    }
  };
};

const newTen = async (filters = {}) => {
  // Last 10 purchases (only users with image + package)
  const ten = await prisma.user.findMany({
    where: {
      role: "CLIENT",
      image: {
        not: null,   // must not be null
        notIn: [""]  // must not be an empty string
      },
    },
    include: {
      living: true,
      UserPackage: {
        orderBy: {
          createdAt: "desc", // latest first
        },
        take: 1, // only the latest package
        include: {
          package: true, // fetch package details
        },
      },
    },
    orderBy: { createdAt: "desc" }, // newest users first
    take: 4, // limit to 10
  });

  // Flatten UserPackage to `package`
  const formatted = ten.map(({ UserPackage, ...rest }) => ({
    ...rest,
    package: UserPackage[0] || null,
  }));

  return { ten: formatted };
};



const getProfileVisitors = async (userId) => {
  return prisma.profileVisit.findMany({
    where: { visitedId: userId },
    orderBy: { visitedAt: 'desc' },
    include: {
      visitor: true

    },
  });
};



const checkDailyLikeLimit = async (userId) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { isPremium: true },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  if (user.isPremium) {
    return; // No limit for premium users
  }

  // Non-premium → apply daily limit
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const likesSentToday = await prisma.like.count({
    where: {
      senderId: userId,
      createdAt: {
        gte: startOfDay,
        lte: endOfDay,
      },
    },
  });

  if (likesSentToday >= 3) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "Daily like limit reached. Upgrade to premium for unlimited likes."
    );
  }
};

const recordProfileVisit = async (visitorId, visitedId) => {
  return prisma.profileVisit.upsert({
    where: {
      visitorId_visitedId: {
        visitorId,
        visitedId,
      },
    },
    update: {
      visitedAt: new Date(), // refresh last visit timestamp
    },
    create: {
      visitorId,
      visitedId,
    },
  });
};

module.exports = {
  getProfileVisitors,
  recordProfileVisit,
  getCombinedReportService,
  checkDailyLikeLimit,
  getSentLikes,
  newTen,
  getPackageReportService,
  getAnalyticsReport,
  getMemberReport,
  getUserReport,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  getAllUsers,
  getDashboardStats,
  createPhotoRequest,
  getPhotoRequest,
  getPhotoRequestById,
  approvePhotoRequest,
  denyPhotoRequest,
  getPhotoRequests,
  getUserPhotoSettings,
  canViewPhotos,
  getUserPhotos,
  getAcceptedLikes,
  canUsersMessage,
  createConnection,
  checkConnection,
  createLike,
  getLikeById,
  getLikeBetweenUsers,
  acceptLike,
  declineLike,
  getLikesReceived,
  searchUsers,
  getTodaysTopMatches,
  getYouMayAlsoLike,
  createUser,
  getUserByEmail,
  updateAdmin,
  // User services
  getUserById,
  updateUserById,
  deleteUserById,

  // EducationCareer services
  createEducationCareer,
  getEducationCareerByUserId,
  updateEducationCareerByUserId,
  deleteEducationCareerByUserId,

  // PersonalityBehavior services
  createPersonalityBehavior,
  getPersonalityBehaviorByUserId,
  updatePersonalityBehaviorByUserId,
  deletePersonalityBehaviorByUserId,

  // PartnerExpectation services
  createPartnerExpectation,
  getPartnerExpectationByUserId,
  updatePartnerExpectationByUserId,
  deletePartnerExpectationByUserId,

  // Lifestyle services
  createLifestyle,
  getLifestyleByUserId,
  updateLifestyleByUserId,
  deleteLifestyleByUserId,

  // HobbiesInterests services
  createHobbiesInterests,
  getHobbiesInterestsByUserId,
  updateHobbiesInterestsByUserId,
  deleteHobbiesInterestsByUserId,

  // LanguageInfo services
  createLanguageInfo,
  getLanguageInfoByUserId,
  updateLanguageInfoByUserId,
  deleteLanguageInfoByUserId,

  // Living services
  createLiving,
  getLivingByUserId,
  updateLivingByUserId,
  deleteLivingByUserId,

  // PhysicalAppearance services
  createPhysicalAppearance,
  getPhysicalAppearanceByUserId,
  updatePhysicalAppearanceByUserId,
  deletePhysicalAppearanceByUserId,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getPhotoSetting,
  updatePhotoSetting,

  createTicket,
  getUserTickets,
  updateTicketStatus,
  addReplyToTicket,
  getTicketWithReplies,
  getAllTickets,
  createRole,
  getStaff
};
