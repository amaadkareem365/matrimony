const express = require("express");
const validate = require("../middlewares/validate");
const settingsValidation = require("../validations/basicSetting.validation");
const settingsController = require("../controllers/basicSettings.controller");
const auth = require("../middlewares/auth");
const router = express.Router();



router
  .route("/basic-setting")
  .get(settingsController.getBasicSettings)
  .patch(validate(settingsValidation.updateBasicSettings), settingsController.updateBasicSettings);
router
  .route("/cookie-settings")
  .get(settingsController.getCookieSettings)
  .patch(validate(settingsValidation.updateCookieSettings), settingsController.updateCookieSettings);





router
  .route("/seo-settings")
  .get(settingsController.getSeoSettings)
  .patch(validate(settingsValidation.updateSeoSettings), settingsController.updateSeoSettings);



router
  .route("/email-templates")
  .get(settingsController.getAllEmailTemplates)
  .post(validate(settingsValidation.createEmailTemplate), settingsController.createEmailTemplate);

router
  .route("/email-templates/:id")
  .get(settingsController.getEmailTemplate)
  .patch(validate(settingsValidation.updateEmailTemplate), settingsController.updateEmailTemplate);


router
  .route("/language")
  .post(validate(settingsValidation.createLanguage), settingsController.createLanguage)
  .get(settingsController.getLanguages);

router
  .route("/language/:languageId")
  .patch(validate(settingsValidation.updateLanguage), settingsController.updateLanguage)
  .delete(validate(settingsValidation.languageIdParam), settingsController.deleteLanguage);

router
  .route("/translation")
  .post(
    settingsController.createTranslation
  );

router
  .route("/translation/:languageCode/:key")
  .get(
    settingsController.getTranslationByCodeAndKey
  )
  .put(
    settingsController.updateTranslationByCodeAndKey
  );



router
  .route('/google')
  .get(settingsController.getGoogleLogin)
  .patch(validate(settingsValidation.googleSchema), settingsController.updateGoogleLogin);

router
  .route('/facebook')
  .get(settingsController.getFacebookLogin)
  .patch(validate(settingsValidation.facebookSchema), settingsController.updateFacebookLogin);

router
  .route('/recaptcha')
  .get(settingsController.getRecaptcha)
  .patch(settingsController.updateRecaptcha);

router
  .route('/mollie')
  .get(settingsController.getMollie)
  .patch(validate(settingsValidation.mollieSchema), settingsController.updateMollie);

router
  .route('/stripe')
  .get(settingsController.getStripe)
  .patch(validate(settingsValidation.stripeSchema), settingsController.updateStripe);

router
  .route('/smtp')
  .get(settingsController.getSMTP)
  .patch(validate(settingsValidation.smtpSchema), settingsController.updateSMTP);

router
  .route('/push')
  .get(settingsController.getPush)
  .patch(validate(settingsValidation.pushNotificationSchema), settingsController.updatePush);


router
  .route('/currency')
  .get(settingsController.getAllCurrencies)
  .post(validate(settingsValidation.currencySchema), settingsController.createCurrency)



router
  .route('/currency/:id')
  .patch(validate(settingsValidation.currencySchema), settingsController.updateCurrency)
  .delete(settingsController.deleteCurrency);

router
  .route('/currency-setting')
  .get(settingsController.getCurrencySetting)
  .patch(settingsController.updateCurrencySetting);


router
  .route('/abusive')
  .get(settingsController.getAllAbusive)
  .patch(validate(settingsValidation.abusiveWordSchema), settingsController.updateAbusive)



router.get(
  '/homepage',
  settingsController.getHomepageSettings
);

router.patch(
  '/homepage',
  validate(settingsValidation.updateHomepageSettings),
  settingsController.updateHomepageSettings
);

// Contact Page Settings Routes
router.get(
  '/contact-page',
  settingsController.getContactPageSettings
);

router.patch(
  '/contact-page',

  validate(settingsValidation.updateContactPageSettings),
  settingsController.updateContactPageSettings
);

// Registration Page Routes
router.get('/registration-page', settingsController.getRegistrationPageSettings);
router.patch(
  '/registration-page',
  validate(settingsValidation.updateRegistrationPage),
  settingsController.updateRegistrationPageSettings
);

// Terms & Conditions Routes
router.get('/terms-conditions', settingsController.getTermsPageSettings);
router.patch(
  '/terms-conditions',
  validate(settingsValidation.updateTermsPage),
  settingsController.updateTermsPageSettings
);

router.get(
  '/agenda',
  settingsController.getAgendaPageSettings
);

router.patch(
  '/agenda',

  validate(settingsValidation.updateAgendaPageSettings),
  settingsController.updateAgendaPageSettings
);

router.get(
  '/vee-page',
  settingsController.getVeePageSettings
);

router.patch(
  '/vee-page',

  validate(settingsValidation.updateVeePageSettings),
  settingsController.updateVeePageSettings
);


router.get(
  '/how-it-works',
  settingsController.getHowWorksPageSettings
);

router.patch(
  '/how-it-works',
  validate(settingsValidation.updateHowWorksPageSettings),
  settingsController.updateHowWorksPageSettings
);


router.post(
  '/basic-pages',
  validate(settingsValidation.createPageSettings),
  settingsController.createPageSettings
);

router.get(
  '/basic-pages/:id',
  validate(settingsValidation.getPageSettings),
  settingsController.getPageSettings
);

router.get(
  '/basic-pages/by-url',
  validate(settingsValidation.getPageByUrlSettings),
  settingsController.getPageByUrlSettings
);

router.patch(
  '/basic-pages/:id',

  validate(settingsValidation.updatePageSettings),
  settingsController.updatePageSettings
);

router.delete(
  '/basic-pages/:id',

  validate(settingsValidation.deletePageSettings),
  settingsController.deletePageSettings
);
router.get(
  '/all-pages',
  settingsController.getAllPages
);

router.post('/page-view',   settingsController.incrementPageView);


router.get(
  '/defaultPrefence',
  settingsController.getSystemSettings
);

router.patch(
  '/defaultPrefence',
  validate(settingsValidation.updateSystemSettings),
  settingsController.updateSystemSettings
);


router.get("/footer", settingsController.getFooter);
router.patch("/footer", validate(settingsValidation.updateFooter), settingsController.updateFooter);

// Footer Sections
router.patch("/footer/sections",  settingsController.createSection);
router.patch("/footer/sections/:id", settingsController.updateSection);
router.get("/footer/sections/:id",  settingsController.getSectionById);
router.get("/footer/sections",  settingsController.getSection);
router.delete("/footer/sections/:id", settingsController.deleteSection);
router.get('/user-dashboard', settingsController.getAllUserDashboards);

router.patch(
  '/user-dashboard',
  settingsController.patchUserDashboard
);
router
  .route("/translation")
  .post(
    settingsController.createTranslation
  );
  router
  .route("/translation/:languageCode")
  .get(settingsController.getAllTranslationsByLanguageCode);
  router
  .route("/translation/:languageCode")
  .patch(settingsController.updateMultipleTranslationsByLanguageCode);
module.exports = router;