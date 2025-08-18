const express = require("express");
const validate = require("../middlewares/validate");
const { userValidation } = require("../validations");
const { userController } = require("../controllers");
const auth = require("../middlewares/auth");

const router = express.Router();




router.get("/search", auth(), userController.searchUsers);
router.get("/today-matches",auth(), userController.getTodaysTopMatches)
router.get("/may-like",auth(), userController.getYouMayAlsoLike)
router.get('/detail-report',  userController.getUserReportController);
router.get('/member-report',  userController.memberReportController);
router.get('/analytics-report',  userController.analyticsReportController);
router.get("/packages", userController.getPackageReport);
router.get("/new-10", userController.newTen);
router.get('/blocked', auth(), userController.getBlockedUsers);

router.post("/", validate(userValidation.createUser), userController.createUser);
router.post('/image-request',auth(), userController.requestPhotoAccess);
router.post('/image-request/:requestId/respond',auth(), userController.respondToPhotoRequest);
router.get('/image-request',auth(), userController.getPhotoRequests);
router
  .route('/photo-setting')
  .get(auth(), userController.getPhotoSetting)
  .patch(auth(), validate(userValidation.photoSettingSchema), userController.updatePhotoSetting);
// User CRUD
router.post("/roles", validate(userValidation.createRole), userController.createRole);
router.get("/roles", userController.getRoles);
router.get("/roles/:id", userController.getRoleById);
router.patch("/roles/:id", validate(userValidation.updateRole), userController.updateRole);
router.delete("/roles/:id", userController.deleteRole);

router.get("/:userId", validate(userValidation.userIdParam), userController.getUser);
router.patch("/:userId", validate(userValidation.updateUser), userController.updateUser);
router.delete("/:userId", validate(userValidation.userIdParam), userController.deleteUser);
router.get("/", validate(userValidation.getAllUsers), userController.getAllUsers);
router.get("/staff/staff-members", userController.getStaff);
router.get("/dashboard/stats", userController.getDashboardStats);



// EducationCareer Routes
router.post("/:userId/education-career", validate(userValidation.educationCareer), userController.createEducationCareer);
router.get("/:userId/education-career", validate(userValidation.userIdParam), userController.getEducationCareer);
router.patch("/:userId/education-career", validate(userValidation.educationCareerUpdate), userController.updateEducationCareer);
router.delete("/:userId/education-career", validate(userValidation.userIdParam), userController.deleteEducationCareer);

// PersonalityBehavior Routes
router.post("/:userId/personality-behavior", validate(userValidation.personalityBehavior), userController.createPersonalityBehavior);
router.get("/:userId/personality-behavior", validate(userValidation.userIdParam), userController.getPersonalityBehavior);
router.patch("/:userId/personality-behavior", validate(userValidation.personalityBehaviorUpdate), userController.updatePersonalityBehavior);
router.delete("/:userId/personality-behavior", validate(userValidation.userIdParam), userController.deletePersonalityBehavior);

// PartnerExpectation Routes
router.post("/:userId/partner-expectation", userController.createPartnerExpectation);
router.get("/:userId/partner-expectation", validate(userValidation.userIdParam), userController.getPartnerExpectation);
router.patch("/:userId/partner-expectation",  userController.updatePartnerExpectation);
router.delete("/:userId/partner-expectation", validate(userValidation.userIdParam), userController.deletePartnerExpectation);

// Lifestyle Routes
router.post("/:userId/lifestyle", validate(userValidation.lifestyle), userController.createLifestyle);
router.get("/:userId/lifestyle", validate(userValidation.userIdParam), userController.getLifestyle);
router.patch("/:userId/lifestyle", validate(userValidation.lifestyleUpdate), userController.updateLifestyle);
router.delete("/:userId/lifestyle", validate(userValidation.userIdParam), userController.deleteLifestyle);

// HobbiesInterests Routes
router.post("/:userId/hobbies-interests", validate(userValidation.hobbiesInterests), userController.createHobbiesInterests);
router.get("/:userId/hobbies-interests", validate(userValidation.userIdParam), userController.getHobbiesInterests);
router.patch("/:userId/hobbies-interests", validate(userValidation.hobbiesInterestsUpdate), userController.updateHobbiesInterests);
router.delete("/:userId/hobbies-interests", validate(userValidation.userIdParam), userController.deleteHobbiesInterests);

// LanguageInfo Routes
router.post("/:userId/language-info", validate(userValidation.languageInfo), userController.createLanguageInfo);
router.get("/:userId/language-info", validate(userValidation.userIdParam), userController.getLanguageInfo);
router.patch("/:userId/language-info", validate(userValidation.languageInfoUpdate), userController.updateLanguageInfo);
router.delete("/:userId/language-info", validate(userValidation.userIdParam), userController.deleteLanguageInfo);

// Living Routes
router.post("/:userId/living", validate(userValidation.living), userController.createLiving);
router.get("/:userId/living", validate(userValidation.userIdParam), userController.getLiving);
router.patch("/:userId/living", validate(userValidation.livingUpdate), userController.updateLiving);
router.delete("/:userId/living", validate(userValidation.userIdParam), userController.deleteLiving);

// PhysicalAppearance Routes
router.post("/:userId/physical-appearance", validate(userValidation.physicalAppearance), userController.createPhysicalAppearance);
router.get("/:userId/physical-appearance", validate(userValidation.userIdParam), userController.getPhysicalAppearance);
router.patch("/:userId/physical-appearance", validate(userValidation.physicalAppearanceUpdate), userController.updatePhysicalAppearance);
router.delete("/:userId/physical-appearance", validate(userValidation.userIdParam), userController.deletePhysicalAppearance);




router.post('/block', auth(), userController.blockUser);
router.post('/unblock', auth(), userController.unblockUser);



router
  .route('/support-tickets')
  .get(auth(), userController.getTickets)
  .post(auth(), validate(userValidation.supportTicketSchema), userController.createTicket);

  router.get('/support-tickets/all', auth(), userController.getAllTickets);
router
  .route('/support-tickets/status')
  .patch(auth(), validate(userValidation.updateTicketStatusSchema), userController.updateTicketStatus);
router
  .route('/support-tickets/:id')
  .get(auth(), userController.getTicketWithReplies); // GET /support/12

router
  .route('/support-tickets/reply')
  .post(auth(), validate(userValidation.supportReplySchema), userController.replyToTicket);




router.post('/like',auth() ,userController.sendLike);
router.post('/like/:likeId/respond',auth(), userController.respondToLike);
router.get('/like/received',auth(), userController.getReceivedLikes);
router.get('/:userId/can-message',auth(), userController.checkCanMessage);
router.get('/like/accepted',auth(), userController.getAcceptedLikes);
router.get('/like/sent',auth(), userController.getSentLikes);


module.exports = router;