const httpStatus = require('http-status');
const catchAsync = require('../utils/catchAsync');
const { userService ,authService} = require('../services');
const  emailService  = require('../services/email.service');
const { PrismaClient, Role } = require("@prisma/client");
const ApiError = require("../utils/ApiError");
const { user } = require('../utils/db');
const prisma = new PrismaClient();
// User CRUD Controllers
const createUser = catchAsync(async (req, res) => {
  const password = req.body.password;
  const user = await userService.createUser(req.body);
   await emailService.sendAccountCreatedByAdminEmail(user.id, password);
      await authService.createUserActivity(req.user.id, "MEMEBER_REGISTERED"
        , `New memeber got registered with the email ${req.body.email}`);
  res.status(httpStatus.CREATED).send(user);
});

const getUser = catchAsync(async (req, res) => {
  const user = await userService.getUserById(req.params.userId);
  res.send(user);
});

const updateUser = catchAsync(async (req, res) => {
  const user = await userService.updateUserById(req.params.userId, req.body);
  res.send(user);
});

const deleteUser = catchAsync(async (req, res) => {
  await userService.deleteUserById(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// EducationCareer Controllers
const createEducationCareer = catchAsync(async (req, res) => {
  const educationCareer = await userService.createEducationCareer(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(educationCareer);
});
const getAllUsers = catchAsync(async (req, res) => {
  const users = await userService.getAllUsers(req.query);
  res.send(users);
});

const getStaff = catchAsync(async (req, res) => {
  const users = await userService.getStaff(req.query);
  res.send(users);
});

const getDashboardStats = catchAsync(async (req, res) => {
  const stats = await userService.getDashboardStats();
  res.send(stats);
});



const recordProfileVisit = catchAsync(async (req, res) => {
  const { targetId } = req.body;
  const visitorId = req.user.id;

  if (visitorId === targetId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot visit your own profile');
  }
  // Record or update visit
  const visit = await userService.recordProfileVisit(visitorId, +targetId);
  await emailService.sendProfileVisitEmail({
    recipientId: +targetId,
    visitorId,
  });
  // Optionally send notification to the visited user

  res.status(httpStatus.CREATED).send({
    status: 'success',
    data: visit
  });
});

const getProfileVisitors = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const visitors = await userService.getProfileVisitors(userId);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: visitors,
  });
});



const getEducationCareer = catchAsync(async (req, res) => {
  const educationCareer = await userService.getEducationCareerByUserId(req.params.userId);
  res.send(educationCareer);
});

const updateEducationCareer = catchAsync(async (req, res) => {
  const educationCareer = await userService.updateEducationCareerByUserId(req.params.userId, req.body);
  res.send(educationCareer);
});

const deleteEducationCareer = catchAsync(async (req, res) => {
  await userService.deleteEducationCareerByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// PersonalityBehavior Controllers
const createPersonalityBehavior = catchAsync(async (req, res) => {
  const personalityBehavior = await userService.createPersonalityBehavior(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(personalityBehavior);
});

const getPersonalityBehavior = catchAsync(async (req, res) => {
  const personalityBehavior = await userService.getPersonalityBehaviorByUserId(req.params.userId);
  res.send(personalityBehavior);
});

const updatePersonalityBehavior = catchAsync(async (req, res) => {
  const personalityBehavior = await userService.updatePersonalityBehaviorByUserId(req.params.userId, req.body);
  res.send(personalityBehavior);
});

const deletePersonalityBehavior = catchAsync(async (req, res) => {
  await userService.deletePersonalityBehaviorByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// PartnerExpectation Controllers
const createPartnerExpectation = catchAsync(async (req, res) => {
  const partnerExpectation = await userService.createPartnerExpectation(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(partnerExpectation);
});

const getPartnerExpectation = catchAsync(async (req, res) => {
  const partnerExpectation = await userService.getPartnerExpectationByUserId(req.params.userId);
  res.send(partnerExpectation);
});

const updatePartnerExpectation = catchAsync(async (req, res) => {
  const partnerExpectation = await userService.updatePartnerExpectationByUserId(req.params.userId, req.body);
  res.send(partnerExpectation);
});

const deletePartnerExpectation = catchAsync(async (req, res) => {
  await userService.deletePartnerExpectationByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Lifestyle Controllers
const createLifestyle = catchAsync(async (req, res) => {
  const lifestyle = await userService.createLifestyle(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(lifestyle);
});

const getLifestyle = catchAsync(async (req, res) => {
  const lifestyle = await userService.getLifestyleByUserId(req.params.userId);
  res.send(lifestyle);
});

const updateLifestyle = catchAsync(async (req, res) => {
  const lifestyle = await userService.updateLifestyleByUserId(req.params.userId, req.body);
  res.send(lifestyle);
});

const deleteLifestyle = catchAsync(async (req, res) => {
  await userService.deleteLifestyleByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// HobbiesInterests Controllers
const createHobbiesInterests = catchAsync(async (req, res) => {
  const hobbiesInterests = await userService.createHobbiesInterests(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(hobbiesInterests);
});

const getHobbiesInterests = catchAsync(async (req, res) => {
  const hobbiesInterests = await userService.getHobbiesInterestsByUserId(req.params.userId);
  res.send(hobbiesInterests);
});

const updateHobbiesInterests = catchAsync(async (req, res) => {
  const hobbiesInterests = await userService.updateHobbiesInterestsByUserId(req.params.userId, req.body);
  res.send(hobbiesInterests);
});

const deleteHobbiesInterests = catchAsync(async (req, res) => {
  await userService.deleteHobbiesInterestsByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// LanguageInfo Controllers
const createLanguageInfo = catchAsync(async (req, res) => {
  const languageInfo = await userService.createLanguageInfo(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(languageInfo);
});

const getLanguageInfo = catchAsync(async (req, res) => {
  const languageInfo = await userService.getLanguageInfoByUserId(req.params.userId);
  res.send(languageInfo);
});

const updateLanguageInfo = catchAsync(async (req, res) => {
  const languageInfo = await userService.updateLanguageInfoByUserId(req.params.userId, req.body);
  res.send(languageInfo);
});

const deleteLanguageInfo = catchAsync(async (req, res) => {
  await userService.deleteLanguageInfoByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// Living Controllers
const createLiving = catchAsync(async (req, res) => {
  const living = await userService.createLiving(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(living);
});

const getLiving = catchAsync(async (req, res) => {
  const living = await userService.getLivingByUserId(req.params.userId);
  res.send(living);
});

const updateLiving = catchAsync(async (req, res) => {
  const living = await userService.updateLivingByUserId(req.params.userId, req.body);
  res.send(living);
});

const deleteLiving = catchAsync(async (req, res) => {
  await userService.deleteLivingByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});

// PhysicalAppearance Controllers
const createPhysicalAppearance = catchAsync(async (req, res) => {
  const physicalAppearance = await userService.createPhysicalAppearance(req.params.userId, req.body);
  res.status(httpStatus.CREATED).send(physicalAppearance);
});

const getPhysicalAppearance = catchAsync(async (req, res) => {
  const physicalAppearance = await userService.getPhysicalAppearanceByUserId(req.params.userId);
  res.send(physicalAppearance);
});

const updatePhysicalAppearance = catchAsync(async (req, res) => {
  const physicalAppearance = await userService.updatePhysicalAppearanceByUserId(req.params.userId, req.body);
  res.send(physicalAppearance);
});

const deletePhysicalAppearance = catchAsync(async (req, res) => {
  await userService.deletePhysicalAppearanceByUserId(req.params.userId);
  res.status(httpStatus.NO_CONTENT).send();
});




const blockUser = catchAsync(async (req, res) => {
  const { blockedUserId } = req.body;
  const blockerId = req.user.id;
   console.log(blockerId,blockedUserId)
 const respose= await userService.blockUser(blockerId, blockedUserId);
  res.status(200).json({ message: respose.message });
});

const unblockUser = catchAsync(async (req, res) => {
  const { blockedUserId } = req.body;
  const blockerId = req.user.id;

  await userService.unblockUser(blockerId, blockedUserId);
  res.status(200).json({ message: 'User unblocked successfully' });
});


const getBlockedUsers = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const blockedUsers = await userService.getBlockedUsers(userId);
  res.status(200).json(blockedUsers);
});



const getPhotoSetting = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const setting = await userService.getPhotoSetting(userId);
  res.status(200).json(setting);
});

const updatePhotoSetting = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const setting = await userService.updatePhotoSetting(userId, req.body);
  res.status(200).json(setting);
});



const createTicket = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const ticket = await userService.createTicket(userId, req.body);
  await emailService.notifyAdminsNewTicket(ticket);
  res.status(201).json(ticket);
});

const getTickets = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const tickets = await userService.getUserTickets(userId);
  res.status(200).json(tickets);
});

const updateTicketStatus = catchAsync(async (req, res) => {
  const { id, status } = req.body;
  const updated = await userService.updateTicketStatus(id, status);
  res.status(200).json(updated);
});


const replyToTicket = catchAsync(async (req, res) => {
  const senderId = req.user.id;
  const { ticketId, message } = req.body;
  const reply = await userService.addReplyToTicket(ticketId, senderId, message);
  res.status(201).json(reply);
});

const getTicketWithReplies = catchAsync(async (req, res) => {
  const { id } = req.params;
  const ticket = await userService.getTicketWithReplies(parseInt(id));
  res.status(200).json(ticket);
});


const getAllTickets = catchAsync(async (req, res) => {
  // You could add a role check here if not handled in middleware
  const tickets = await userService.getAllTickets();
  res.status(200).json(tickets);
});


const searchUsers = catchAsync(async (req, res) => {
  // Extract filters from query parameters
  const filters = {
    gender: req.query.gender,
    relationshipStatus: req.query.relationshipStatus,
    country: req.query.country,
    state: req.query.state,
    city: req.query.city,
    religion: req.query.religion,
    education: req.query.education,
    firstName: req.query.quickSearch,
    hasChildren: req.query.hasChildren ?
      (req.query.hasChildren === 'true') : undefined,
    page: req.query.page || 1,
    limit: req.query.limit || 10,

  };

  // Execute search
  const searchResults = await userService.searchUsers(+req.user.id, filters);

  // Apply photo privacy settings
  const finalResults = searchResults.results.map(user => {
    if (user.PhotoSetting) {
      if (user.PhotoSetting.blurForFreeMembers && !req.user.isPremium) {
        return {
          ...user,
          image: user.image ? 'blurred-placeholder.jpg' : null
        };
      }
    }
    return user;
  });

  res.status(httpStatus.OK).send({
    status: "success",
    data: {
      ...searchResults,
      results: finalResults
    }
  });
});



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

// Today's Top Matches
const getTodaysTopMatches = catchAsync(async (req, res) => {
  const matches = await userService.getTodaysTopMatches(req.user.id);

  // Get current user for scoring
  const currentUser = await prisma.user.findUnique({
    where: { id: req.user.id },
    include: {
      partnerExpectation: true,
      lifestyle: true,
      personalityBehavior: true,
      PhotoSetting: true,
      hobbiesInterests: true,
      living: true
    }
  });

  // Calculate scores and sort
  const scoredMatches = matches.map(match => ({
    ...match,
    matchScore: calculateMatchScore(currentUser, match)
  })).sort((a, b) => b.matchScore - a.matchScore);

  // Apply photo privacy settings
  const finalMatches = scoredMatches.map(match => {
    if (match.PhotoSetting) {
      if (match.PhotoSetting.blurForFreeMembers && !req.user.isPremium) {
        return {
          ...match,
          image: match.image ? 'blurred-placeholder.jpg' : null
        };
      }
    }
    return match;
  });

  res.status(httpStatus.OK).send({
    status: "success",
    data: finalMatches
  });
});

// You May Also Like
const getYouMayAlsoLike = catchAsync(async (req, res) => {
  const suggestions = await userService.getYouMayAlsoLike(req.user.id);

  // Apply photo privacy settings
  const finalSuggestions = suggestions.map(match => {
    if (match.PhotoSetting) {
      if (match.PhotoSetting.blurForFreeMembers && !req.user.isPremium) {
        return {
          ...match,
          image: match.image ? 'blurred-placeholder.jpg' : null
        };
      }
    }
    return match;
  });

  res.status(httpStatus.OK).send({
    status: "success",
    data: finalSuggestions
  });
});


const sendLike = catchAsync(async (req, res) => {
  const { receiverId } = req.body;
  const senderId = req.user.id;

  if (senderId === receiverId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You cannot like yourself');
  }

  // Check if like already exists
  await userService.checkDailyLikeLimit(senderId);

  const existingLike = await userService.getLikeBetweenUsers(senderId, receiverId);
  if (existingLike) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You have already liked this user');
  }

  // Check if users are already connected
  const existingConnection = await userService.checkConnection(senderId, receiverId);
  if (existingConnection) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'You are already connected with this user');
  }

  const like = await userService.createLike(senderId, receiverId);

  // Send notification to receiver

  res.status(httpStatus.CREATED).send({
    status: 'success',
    data: like
  });
});

const respondToLike = catchAsync(async (req, res) => {
  const { likeId } = req.params;
  const { action } = req.body; // 'accept' or 'decline'
  const responderId = req.user.id;

  const like = await userService.getLikeById(likeId);

  if (!like) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Like not found');
  }

  if (like.receiverId !== responderId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not the recipient of this like');
  }

  if (like.status !== 'PENDING') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Like has already been processed');
  }

  let result;
  if (action === 'ACCEPTED') {
    result = await userService.acceptLike(+likeId);

    // Create connection between users
    await userService.createConnection(like.senderId, like.receiverId);

    // Notify sender about acceptance
  } else if (action === 'DECLINED') {
    result = await userService.declineLike(+likeId);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid action');
  }

  res.status(httpStatus.OK).send({
    status: 'success',
    data: result
  });
});

const getReceivedLikes = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { status } = req.query;

  const likes = await userService.getLikesReceived(userId, status);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: likes
  });
});


const checkCanMessage = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const currentUserId = req.user.id;
 if(!req.user.isPremium){
   throw new ApiError(httpStatus.FORBIDDEN, 'please buy premium to send the message');
 }
  // Check if users are connected
  const areConnected = await userService.checkConnection(currentUserId, userId);
  if (!areConnected) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You are not connected with this user');
  }

  // Check if at least one user is VIP
  const canMessage = await userService.canUsersMessage(currentUserId, userId);
  res.status(httpStatus.OK).send({
    status: 'success',
    data: {
      canMessage,
      requiresUpgrade: !canMessage
    }
  });
});


const getAcceptedLikes = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const like = await userService.getAcceptedLikes(userId);
  await sendLikeAcceptedEmail({ senderId: like.senderId, receiverId: like.receiverId });

  res.status(httpStatus.OK).send({
    status: 'success',
    data: like
  });
});

const getSentLikes = catchAsync(async (req, res) => {
  const userId = req.user.id;

  const acceptedLikes = await userService.getSentLikes(userId);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: acceptedLikes
  });
});

const requestPhotoAccess = catchAsync(async (req, res) => {
  const { targetId } = req.body;
  const requesterId = req.user.id;

  if (requesterId === targetId) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Cannot request your own photos');
  }

  // Check if target has photos set to "onRequestOnly"
  const targetSettings = await userService.getUserPhotoSettings(targetId);
  if (!targetSettings?.onRequestOnly) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'User is not accepting photo request');
  }
  // Check for existing request
  const existingRequest = await userService.getPhotoRequest(requesterId, targetId);
  if (existingRequest) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Photo request already exists');
  }
  const request = await userService.createPhotoRequest(requesterId, targetId);
  // Send notification to target
  await emailService.sendPhotoRequestEmail({ requesterId, targetId });
  res.status(httpStatus.CREATED).send({
    status: 'success',
    data: request
  });
});

const respondToPhotoRequest = catchAsync(async (req, res) => {
  const { requestId } = req.params;
  const { action } = req.body; // 'approve' or 'deny'
  const responderId = req.user.id;
 
  const request = await userService.getPhotoRequestById(requestId);

  if (!request) {
    throw new ApiError(httpStatus.NOT_FOUND, 'Photo request not found');
  }

  if (request.targetId !== responderId) {
    throw new ApiError(httpStatus.FORBIDDEN, 'Not authorized to respond to this request');
  }

  if (request.status !== 'PENDING') {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Request has already been processed');
  }

  let result;
  if (action === 'approve') {
    result = await userService.approvePhotoRequest(requestId);
  } else if (action === 'deny') {
    result = await userService.denyPhotoRequest(requestId);
  } else {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Invalid action');
  }

  res.status(httpStatus.OK).send({
    status: 'success',
    data: result
  });
});

const getPhotoRequests = catchAsync(async (req, res) => {
  const userId = req.user.id;
  const { type = 'received', status } = req.query; // 'received' or 'sent'

  const requests = await userService.getPhotoRequests(userId, type, status);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: requests
  });
});

const getAccessiblePhotos = catchAsync(async (req, res) => {
  const { userId } = req.params;
  const requesterId = req.user.id;

  // Check photo access rules
  const canView = await userService.canViewPhotos(userId, requesterId);

  if (!canView) {
    throw new ApiError(httpStatus.FORBIDDEN, 'You do not have permission to view these photos');
  }

  const photos = await userService.getUserPhotos(userId, requesterId);

  res.status(httpStatus.OK).send({
    status: 'success',
    data: photos
  });
});

const createRole = catchAsync(async (req, res) => {
  const role = await userService.createRole(req.body);
  res.status(httpStatus.CREATED).send(role);
})


const getRoles = catchAsync(async (req, res) => {
  const roles = await userService.getRoles();
  res.status(httpStatus.OK).send(roles);
});

const getRoleById = catchAsync(async (req, res) => {
  const role = await userService.getRoleById(parseInt(req.params.id));
  res.status(httpStatus.OK).send(role);
});

const updateRole = catchAsync(async (req, res) => {
  const role = await userService.updateRole(parseInt(req.params.id), req.body);
  res.status(httpStatus.OK).send(role);
});

const deleteRole = catchAsync(async (req, res) => {
  await userService.deleteRole(parseInt(req.params.id));
  res.status(httpStatus.NO_CONTENT).send();
});
const getUserReportController = catchAsync(async (req, res) => {
const { startDate, endDate, relationshipStatus, country } = req.query;

    const report = await userService.getUserReport({
      startDate,
      endDate,
      relationshipStatus,
      country
    });
    return res.status(200).json({
      success: true,
      data: report
    });
});


const getAggregatedReport = catchAsync(async (req, res) => {

    const report = await userService.getCombinedReportService ();
    return res.status(200).json({
      success: true,
      data: report
    });
});

const memberReportController = catchAsync(async (req, res) => {
      const { startDate, endDate, relationshipStatus, country } = req.query;
    const report = await userService.getMemberReport({
      startDate,
      endDate,
      relationshipStatus,
      country
    });

    return res.status(200).json({
      success: true,
      data: report
    });
});

const analyticsReportController = catchAsync(async (req, res) => {
      const { startDate, endDate, relationshipStatus, country } = req.query;
    const report = await userService.getAnalyticsReport({
      startDate,
      endDate,
      relationshipStatus,
      country
    });

    return res.status(200).json({
      success: true,
      data: report
    });
});



const getPackageReport = async (req, res) => {
  try {
    const { startDate, endDate, packageId, gender } = req.query;
    const report = await userService.getPackageReportService({
       startDate,
      endDate,
      packageId,
      gender
    });
    res.json(report);
  } catch (err) {
    console.error("Error fetching package report:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};


const newTen = async (req, res) => {
  try {
    const newTen = await userService.newTen({
    });
    res.json(newTen);
  } catch (err) {
    console.error("Error fetching package report:", err);
    res.status(500).json({ error: "Internal server error" });
  }
};
module.exports = {
  
  
  getProfileVisitors,
  recordProfileVisit,
  getSentLikes,
  newTen,
  getPackageReport,
  analyticsReportController,
  memberReportController,
  getUserReportController,
  getStaff,
  getRoles,
  getRoleById,
  updateRole,
  deleteRole,
  createRole,
  requestPhotoAccess,
  getDashboardStats,
  respondToPhotoRequest,
  getPhotoRequests,
  getAccessiblePhotos,
  getAcceptedLikes,
  sendLike,
  respondToLike,
  getReceivedLikes,
  checkCanMessage,
  getTodaysTopMatches,
  getYouMayAlsoLike,
  searchUsers,
  createUser,
  getUser,
  updateUser,
  deleteUser,
  createEducationCareer,
  getEducationCareer,
  updateEducationCareer,
  deleteEducationCareer,
  createPersonalityBehavior,
  getPersonalityBehavior,
  updatePersonalityBehavior,
  deletePersonalityBehavior,
  createPartnerExpectation,
  getPartnerExpectation,
  updatePartnerExpectation,
  deletePartnerExpectation,
  createLifestyle,
  getLifestyle,
  updateLifestyle,
  deleteLifestyle,
  createHobbiesInterests,
  getHobbiesInterests,
  updateHobbiesInterests,
  deleteHobbiesInterests,
  createLanguageInfo,
  getLanguageInfo,
  updateLanguageInfo,
  deleteLanguageInfo,
  createLiving,
  getLiving,
  updateLiving,
  deleteLiving,
  createPhysicalAppearance,
  getPhysicalAppearance,
  updatePhysicalAppearance,
  deletePhysicalAppearance,
  blockUser,
  unblockUser,
  getBlockedUsers,
  getPhotoSetting,
  updatePhotoSetting,
  createTicket,
  getTickets,
  updateTicketStatus,
  replyToTicket,
  getTicketWithReplies,
  getAllTickets,
  searchUsers,
  getAllUsers,
  getAggregatedReport
};