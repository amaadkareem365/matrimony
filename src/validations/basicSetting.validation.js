const Joi = require("joi");
const idField = Joi.number().integer().required();
const createBasicSettings = {
  body: Joi.object({
    systemLogo: Joi.string().uri().optional(),
    systemName: Joi.string().optional(),
    memberPrefix: Joi.string().optional(),
    minimumAge: Joi.number().integer().optional(),
    dateFormat: Joi.string().optional(),
    adminPanelTitle: Joi.string().optional(),
    loginImage: Joi.string().uri().optional(),
    loginMessage: Joi.string().optional(),
    maintenanceMode: Joi.boolean().optional(),
    defaultCurrency: Joi.string().optional(),
    defaultLanguage: Joi.string().optional(),
    serverInformation: Joi.string().allow(null, '').optional(),
    database: Joi.string().allow(null, '').optional()
  })
};

const updateBasicSettings = {
  body: Joi.object({
    systemLogo: Joi.string().uri().optional(),
    systemName: Joi.string().optional(),
    memberPrefix: Joi.string().optional(),
    minimumAge: Joi.number().integer().optional(),
    dateFormat: Joi.string().optional(),
    adminPanelTitle: Joi.string().optional(),
    loginImage: Joi.string().uri().optional(),
    loginMessage: Joi.string().optional(),
    maintenanceMode: Joi.boolean().optional(),
    defaultCurrency: Joi.string().optional(),
    defaultLanguage: Joi.string().optional(),
    serverInformation: Joi.string().allow(null, '').optional(),
    database: Joi.string().allow(null, '').optional()
  }).min(1)
};

const createCookieSettings = {
  body: Joi.object({
    siteKey: Joi.string().optional(),
    showAgreement: Joi.boolean().optional(),
    cookieText: Joi.string().optional()
  })
};

const updateCookieSettings = {
  body: Joi.object({
    siteKey: Joi.string().optional(),
    showAgreement: Joi.boolean().optional(),
    cookieText: Joi.string().optional()
  }).min(1)
};
const createSeoSettings = {
  body: Joi.object({
    metaTitle: Joi.string().optional(),
    metaDescription: Joi.string().optional(),
    metaKeywords: Joi.string().optional(),
    metaImage: Joi.string().uri().optional()
  })
};

const updateSeoSettings = {
  body: Joi.object({
    metaTitle: Joi.string().optional(),
    metaDescription: Joi.string().optional(),
    metaKeywords: Joi.string().optional(),
    metaImage: Joi.string().uri().optional()
  }).min(1)
};


const createEmailTemplate = {
  body: Joi.object({
    key: Joi.string().required(),
    isActive: Joi.boolean().optional(),
    status: Joi.string().optional(),
    translations: Joi.array().items(
      Joi.object({
        language: Joi.string().required(),
        subject: Joi.string().required(),
        content: Joi.string().required()
      })
    ).min(1).required()
  })
};

const updateEmailTemplate = {
  body: Joi.object({
    isActive: Joi.boolean().optional(),
    status: Joi.string().optional(),
    key: Joi.string().optional(),
    translations: Joi.array().items(
      Joi.object({
        id: Joi.number().optional(), // for updates
        language: Joi.string().required(),
        subject: Joi.string().required(),
        content: Joi.string().required()
      })
    ).optional()
  }).min(1)
};


const createLanguage = {
  body: Joi.object({
    code: Joi.string().required(), // e.g., "en", "nl"
    name: Joi.string().required(),
    isActive: Joi.boolean().optional(),
  }),
};

const updateLanguage = {
  params: Joi.object({
    languageId: Joi.number().required(),
  }),
  body: Joi.object({
    code: Joi.string().optional(),
    name: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
  }).min(1),
};

const languageIdParam = {
  params: Joi.object({
    languageId: Joi.number().required(),
  }),
};


const googleSchema = Joi.object({
  clientId: Joi.string().allow(null, ''),
  clientSecret: Joi.string().allow(null, ''),
  isActive: Joi.boolean(),
});

const facebookSchema = Joi.object({
  clientId: Joi.string().allow(null, ''),
  clientSecret: Joi.string().allow(null, ''),
  isActive: Joi.boolean(),
});

const recaptchaSchema = Joi.object({
  siteKey: Joi.string().allow(null, ''),
  siteSecret: Joi.string().allow(null, ''),
});

const mollieSchema = Joi.object({
  key: Joi.string().allow(null, ''),
  secret: Joi.string().allow(null, ''),
  isActive: Joi.boolean(),
});

const stripeSchema = Joi.object({
  key: Joi.string().allow(null, ''),
  publicKey: Joi.string().allow(null, ''),
  isActive: Joi.boolean(),
});

const smtpSchema = Joi.object({
  host: Joi.string().allow(null, ''),
  port: Joi.number().allow(null),
  username: Joi.string().allow(null, ''),
  password: Joi.string().allow(null, ''),
  encryption: Joi.string().allow(null, ''),
  fromAddress: Joi.string().allow(null, ''),
  fromName: Joi.string().allow(null, ''),
});

const pushNotificationSchema = Joi.object({
  isActive: Joi.boolean(),
  fcmApiKey: Joi.string().allow(null, ''),
  authDomain: Joi.string().allow(null, ''),
  projectId: Joi.string().allow(null, ''),
  storageBucket: Joi.string().allow(null, ''),
  messagingSenderId: Joi.string().allow(null, ''),
  appId: Joi.string().allow(null, ''),
  serverKey: Joi.string().allow(null, ''),
});





const currencySchema = Joi.object({
  currencyName: Joi.string().required(),
  currencyCode: Joi.string().required(),
  symbol: Joi.string().required(),
  textDirection: Joi.string().valid('ltr', 'rtl').required(),
});

const updateCurrencySchema = currencySchema.keys({ id: idField });

const currencySettingSchema = Joi.object({
  defaultCurrencyId: Joi.number().integer().required(),
  symbolFormat: Joi.string().valid('prefix', 'suffix').required(), // e.g., $100 or 100$
  decimalSeparator: Joi.string().valid('.', ',').required(),
  decimalPlaces: Joi.number().integer().min(0).max(6).required(),
});

const updateCurrencySettingSchema = currencySettingSchema.keys({ id: idField });


const abusiveWordSchema = Joi.object({
  word: Joi.string().trim().min(1).required(),
});

const updateAbusiveWordSchema = abusiveWordSchema.keys({
  id: idField,
});


const updateHomepageSettings = {
  body: Joi.object({
    Title: Joi.string().allow('', null),
    Url: Joi.string().allow('', null),
    bannerTitle: Joi.string().allow('', null),
    bannerSubTitle: Joi.string().allow('', null),
    bannerImage: Joi.string().allow('', null),
    faqsTitle: Joi.string().allow('', null),
    faqsSubTitle: Joi.string().allow('', null),
    faqsDescription: Joi.string().allow('', null),
    faqname: Joi.string().allow('', null),
    faqlatestTitle: Joi.string().allow('', null),
    faqlatestSubTitle: Joi.string().allow('', null),
    blogTitle: Joi.string().allow('', null),
    datingSiteTitle: Joi.string().allow('', null),
    datingSiteImageTitle1: Joi.string().allow('', null),
    datingSiteImage1: Joi.string().allow('', null),
    datingSiteImageTitle2: Joi.string().allow('', null),
    datingSiteImage2: Joi.string().allow('', null),
    datingSiteImageTitle3: Joi.string().allow('', null),
    datingSiteImage3: Joi.string().allow('', null),
    datingSiteImageTitle4: Joi.string().allow('', null),
    datingSiteImage4: Joi.string().allow('', null),
    showOnHeader: Joi.boolean()
  }).min(1) // At least one field to update
};

const updateContactPageSettings = {
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string().allow("", null),
    contactName: Joi.string().allow('', null),
    contactBannerImage: Joi.string().allow('', null),
    bannerTitle: Joi.string().allow('', null),
    bannerSubTitle: Joi.string().allow('', null),
    bannerDescription: Joi.string().allow('', null),
    addressName: Joi.string().allow('', null),
    addressValue: Joi.string().allow('', null),
    phoneName: Joi.string().allow('', null),
    phoneValue: Joi.string().allow('', null),
    emailName: Joi.string().allow('', null),
    emailValue: Joi.string().email().allow('', null),
    contactFormTitle: Joi.string().allow('', null),
    contactFormDescription: Joi.string().allow('', null),
    showOnHeader: Joi.boolean()
  }).min(1) // At least one field to update
};


// Base validation for all pages
const basePageUpdate = {
  Title: Joi.string(),
  Url: Joi.string(),
  showOnHeader: Joi.boolean(),
  isActive: Joi.boolean()
};

// Registration Page Validation
const updateRegistrationPage = {
  body: Joi.object({
    ...basePageUpdate,
    bannerImage: Joi.string().allow('', null),
    step1Title: Joi.string().allow('', null),
    step1Description: Joi.string().allow('', null),
    step2Title: Joi.string().allow('', null),
    step2Description: Joi.string().allow('', null),
    step3Title: Joi.string().allow('', null),
    step3Description: Joi.string().allow('', null),
    step4Title: Joi.string().allow('', null),
    step4Description: Joi.string().allow('', null),
    myImageTitle: Joi.string().allow('', null),
    myImageDescription: Joi.string().allow('', null),
    myDescriptionTitle: Joi.string().allow('', null),
    myDescriptionPlaceholder: Joi.string().allow('', null),
    step5Title: Joi.string().allow('', null),
    step5Description: Joi.string().allow('', null),
    step6Title: Joi.string().allow('', null),
    step6Description: Joi.string().allow('', null),
    step7Title: Joi.string().allow('', null),
    step7Description: Joi.string().allow('', null)
  }).min(1)
};

// Terms & Conditions Validation
const updateTermsPage = {
  body: Joi.object({
    ...basePageUpdate,
    pageSectiontitle: Joi.string().allow('', null),
    link: Joi.string().allow('', null),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().allow('', null),
    pageType: Joi.string().allow('', null)
  }).min(1)
};

// How It Works Page Validation
const updateHowWorksPage = {
  body: Joi.object({
    ...basePageUpdate,
    bannerImage: Joi.string().allow('', null),
    bannerTitle: Joi.string().allow('', null),
    bannerSubTitle: Joi.string().allow('', null),
    contactName: Joi.string().allow('', null),
    searchPlaceholder: Joi.string().allow('', null),
    faqTitle: Joi.string().allow('', null),
    faqSubTitle: Joi.string().allow('', null),
    faqDescription: Joi.string().allow('', null),
    faqProfileName: Joi.string().allow('', null)
  }).min(1)
};

// Vee Page (FAQ) Validation
const updateVeePage = {
  body: Joi.object({
    ...basePageUpdate,
    title: Joi.string().allow('', null),
    link: Joi.string().allow('', null),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().allow('', null),
    pageType: Joi.string().allow('', null),
    pageName: Joi.string().allow('', null)
  }).min(1)
};

// Agenda Page Validation
const updateAgendaPage = {
  body: Joi.object({
    ...basePageUpdate,
    pageTitle: Joi.string().allow('', null),
    pageSubtitle: Joi.string().allow('', null),
    title: Joi.string().allow('', null),
    link: Joi.string().allow('', null),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().allow('', null),
    pageType: Joi.string().allow('', null)
  }).min(1)
};
const updateAgendaPageSettings = {
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string(),

    // Page Header
    pageTitle: Joi.string().allow('', null),
    pageSubtitle: Joi.string().allow('', null),

    // Page Content Section
    titleContentSection: Joi.string().allow('', null), // match Prisma field name
    link: Joi.string().allow('', null),
    content: Joi.string().allow('', null),

    // SEO Fields Section
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().allow('', null),

    // Page Settings
    pageType: Joi.string().allow('', null),

    // Display Settings
    showOnHeader: Joi.boolean()
  }).min(1)
};


const updateVeePageSettings = {
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string(),
    PageContentitle: Joi.string().allow('', null),
    link: Joi.string().allow('', null),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().allow('', null),
    pageType: Joi.string().allow('', null),
    pageName: Joi.string().allow('', null)
  }).min(1)
};

const updateHowWorksPageSettings = {
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string().uri(),
    bannerImage: Joi.string().allow('', null),
    bannerTitle: Joi.string().allow('', null),
    bannerSubTitle: Joi.string().allow('', null),
    contactName: Joi.string().allow('', null),
    searchPlaceholder: Joi.string().allow('', null),
    faqTitle: Joi.string().allow('', null),
    faqSubTitle: Joi.string().allow('', null),
    faqDescription: Joi.string().allow('', null),
    faqProfileName: Joi.string().allow('', null),
    showOnHeader: Joi.boolean()
  }).min(1)
};

// Terms & Conditions Settings Validation
const updateTermsPageSettings = {
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string().uri(),
    title: Joi.string().allow('', null),
    link: Joi.string().allow('', null),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().allow('', null),
    pageType: Joi.string().allow('', null),
    showOnHeader: Joi.boolean()
  }).min(1)
};



const updateRegistrationPageSettings = {
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string().uri(),
    bannerImage: Joi.string().allow('', null),
    step1Title: Joi.string().allow('', null),
    step1Description: Joi.string().allow('', null),
    step2Title: Joi.string().allow('', null),
    step2Description: Joi.string().allow('', null),
    step3Title: Joi.string().allow('', null),
    step3Description: Joi.string().allow('', null),
    step4Title: Joi.string().allow('', null),
    step4Description: Joi.string().allow('', null),
    myImageTitle: Joi.string().allow('', null),
    myImageDescription: Joi.string().allow('', null),
    myDescriptionTitle: Joi.string().allow('', null),
    myDescriptionPlaceholder: Joi.string().allow('', null),
    step5Title: Joi.string().allow('', null),
    step5Description: Joi.string().allow('', null),
    step6Title: Joi.string().allow('', null),
    step6Description: Joi.string().allow('', null),
    step7Title: Joi.string().allow('', null),
    step7Description: Joi.string().allow('', null),
    showOnHeader: Joi.boolean()
  }).min(1)
};

const createPage = {
  body: Joi.object({
    Title: Joi.string().required(),
    Url: Joi.string().uri().required(),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().uri().allow('', null),
    pageType: Joi.string().valid('Public', 'Private').default('Public'),
    isActive: Joi.boolean().default(true)
  })
};

const updatePage = {
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string().uri(),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().uri().allow('', null),
    pageType: Joi.string().valid('Public', 'Private'),
    isActive: Joi.boolean()
  }).min(1)
};

const getPage = {
  params: Joi.object({
    id: Joi.number().integer().required()
  })
};

const getPageByUrl = {
  query: Joi.object({
    url: Joi.string().uri().required()
  })
};

const deletePage = {
  params: Joi.object({
    id: Joi.number().integer().required()
  })
};

const listPages = {
  query: Joi.object({
    pageType: Joi.string().valid('Public', 'Private'),
    isActive: Joi.boolean(),
    limit: Joi.number().integer().default(10),
    page: Joi.number().integer().default(1)
  })
};


const createPageSettings = {
  body: Joi.object({
    Title: Joi.string().required(),
    Url: Joi.string().uri().required(),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().uri().allow('', null),
    pageType: Joi.string().valid('Public', 'Private').default('Public'),
    isActive: Joi.boolean().default(true)
  })
};

const updatePageSettings = {
  params: Joi.object({
    id: Joi.number().integer().required()
  }),
  body: Joi.object({
    Title: Joi.string(),
    Url: Joi.string().uri(),
    content: Joi.string().allow('', null),
    metaTitle: Joi.string().allow('', null),
    metaDescription: Joi.string().allow('', null),
    keywords: Joi.string().allow('', null),
    metaImage: Joi.string().uri().allow('', null),
    pageType: Joi.string().valid('Public', 'Private'),
    isActive: Joi.boolean()
  }).min(1)
};

const getPageSettings = {
  params: Joi.object({
    id: Joi.number().integer().required()
  })
};

const getPageByUrlSettings = {
  query: Joi.object({
    url: Joi.string().uri().required()
  })
};

const deletePageSettings = {
  params: Joi.object({
    id: Joi.number().integer().required()
  })
};



const updateSystemSettings = {
  body: Joi.object({
    maintenanceMode: Joi.boolean(),
    defaultCurrency: Joi.string(),
    defaultLanguage: Joi.string()
  }).min(1) // At least one field required
};


const updateFooter = {
  body: Joi.object({
    footerLogo: Joi.string().uri().optional(),
    footerDescription: Joi.string().optional(),
    searchName: Joi.string().optional(),
    linkName: Joi.string().optional(),
    footerContent: Joi.string().optional()
  })
};

const createSection = {
  body: Joi.object({
    sectionName: Joi.string().required(),
    pageNames: Joi.string().required(),
    pagesLinks:Joi.string().optional()

  })
};

const updateSection = {
  body: Joi.object({
    sectionName: Joi.string().optional(),
    pageNames: Joi.string().optional(),
    pagesLinks:Joi.string().optional()
  })
};






module.exports = {
  updateFooter,
  createSection,
  updateSection,
  updateSystemSettings,
  createPageSettings,
  updatePageSettings,
  getPageSettings,
  getPageByUrlSettings,
  deletePageSettings,
  updateRegistrationPageSettings,
  updateTermsPageSettings,
  updateHowWorksPageSettings,
  updateVeePageSettings,
  updateAgendaPageSettings,
  updateRegistrationPage,
  updateTermsPage,
  updateHowWorksPage,
  updateVeePage,
  updateAgendaPage,
  updateContactPageSettings,
  createBasicSettings,
  updateBasicSettings,
  createCookieSettings,
  updateCookieSettings,
  createSeoSettings,
  updateSeoSettings,
  createEmailTemplate,
  updateEmailTemplate,
  createLanguage,
  updateLanguage,
  languageIdParam,
  googleSchema,
  facebookSchema,
  recaptchaSchema,
  mollieSchema,
  stripeSchema,
  smtpSchema,
  pushNotificationSchema,
  currencySchema,
  updateCurrencySchema,
  currencySettingSchema,
  updateCurrencySettingSchema,
  abusiveWordSchema,
  updateAbusiveWordSchema,
  updateHomepageSettings,
  createPage,
  updatePage,
  getPage,
  getPageByUrl,
  deletePage,
  listPages
};
