const prisma = require("../utils/db");

const ApiError = require("../utils/ApiError");
const httpStatus = require("http-status");

//basic setting get
const getBasicSettings = async (id) => {
  return await prisma.basicSettings.findFirst();
};

const updateBasicSettings = async (data) => {
  const setting = await prisma.basicSettings.findFirst();

  if (setting) {
    return await prisma.basicSettings.update({
      where: { id: setting.id },
      data,
    });
  } else {
    return await prisma.basicSettings.create({
      data,
    });
  }
};


const createCookieSettings = async (data) => {
  return await prisma.cookieSettings.create({ data });
};

const getCookieSettings = async (id) => {
  return await prisma.cookieSettings.findFirst();
};

const updateCookieSettings = async (data) => {
  const cookie = await prisma.cookieSettings.findFirst();
  if (!cookie) {
    await prisma.cookieSettings.create({ data });
  }
  return await prisma.cookieSettings.update({ where: { id: +cookie.id }, data });
};


const createSeoSettings = async (data) => {
  return await prisma.seoSettings.create({ data });
};

const getSeoSettings = async () => {
  return await prisma.seoSettings.findFirst();
};

const updateSeoSettings = async (data) => {
  const setting = await prisma.seoSettings.findFirst();
  if (!setting) {
    return await prisma.seoSettings.create({ data });
  }
  return await prisma.seoSettings.update({ where: { id: +setting.id }, data });
}

const getAllEmailTemplates = async () => {
  return await prisma.emailTemplate.findMany({
    include: {
      translations: true
    },
    orderBy: { createdAt: 'desc' }
  });
};



const getEmailSentCount = async () => {
  return await prisma.emailSentCount.findFirst();
};


const createEmailTemplate = async (data) => {
  return await prisma.emailTemplate.create({
    data: {
      key: data.key,
      isActive: data.isActive ?? true,
      status: data.status,
      translations: {
        create: data.translations
      }
    },
    include: { translations: true }
  });
};

const getEmailTemplate = async (id) => {
  return await prisma.emailTemplate.findUnique({
    where: { id: +id },
    include: { translations: true }
  });
};

const updateEmailTemplate = async (id, data) => {
  const updateData = {
    isActive: data.isActive,
    status: data.status
  };

  // Update translations separately if provided
  if (data.translations) {
    for (const t of data.translations) {
      const existing = await prisma.emailTemplateTranslation.findFirst({
        where: {
          emailTemplateId: +id,
          language: t.language
        }
      });

      if (existing) {
        await prisma.emailTemplateTranslation.update({
          where: { id: existing.id },
          data: { subject: t.subject, content: t.content }
        });
      } else {
        await prisma.emailTemplateTranslation.create({
          data: {
            emailTemplateId: +id,
            language: t.language,
            subject: t.subject,
            content: t.content
          }
        });
      }
    }
  }

  return await prisma.emailTemplate.update({
    where: { id: +id },
    data: updateData,
    include: { translations: true }
  });
};


const createLanguage = async (data) => {
  return await prisma.language.create({ data });
};

const getLanguages = async () => {
  return await prisma.language.findMany({ orderBy: { code: "asc" } });
};

const updateLanguage = async (id, data) => {
  return await prisma.language.update({ where: { id: +id }, data });
};

const deleteLanguage = async (id) => {
  return await prisma.language.delete({ where: { id: +id } });
};



const updateCredSetting = async (modelName, data) => {
  const model = prisma[modelName];
  const existing = await model.findFirst();

  if (existing) {
    return await model.update({
      where: { id: existing.id },
      data,
    });
  } else {
    return await model.create({ data });
  }
};

const getCredSetting = async (modelName) => {
  return await prisma[modelName].findFirst();
};


const createCurrency = async (data) => {
  return await prisma.currencySetting.create({ data });
};

// Get all currencies
const getAllCurrencies = async () => {
  return await prisma.currencySetting.findMany();
};

// Update a currency by ID
const updateCurrency = async (id, data) => {
  return await prisma.currencySetting.update({
    where: { id },
    data,
  });
};

// Delete a currency by ID
const deleteCurrency = async (id) => {
  const isDefault = await prisma.currencyDefaultSetting.findFirst({
    where: {
      defaultCurrencyId: +id,
    },
  });

  if (isDefault) {
    throw new ApiError(
      httpStatus.BAD_REQUEST,
      "This currency is being used as the default currency. Please change the default currency before deleting this one."
    );
  }
  return await prisma.currencySetting.delete({
    where: { id },
  });
};


const getCurrencySetting = async () => {
  return await prisma.currencyDefaultSetting.findFirst({
    include: { currency: true }, // optional: include related currency
  });
};

const updateCurrencySetting = async (data) => {
  const existing = await prisma.currencyDefaultSetting.findFirst();

  if (existing) {
    return await prisma.currencyDefaultSetting.update({
      where: { id: existing.id },
      data,
    });
  } else {
    return await prisma.currencyDefaultSetting.create({ data });
  }
};


const createAbusive = async (data) => {
  return await prisma.abusiveWord.create({ data });
};

const getAllAbusive = async () => {
  let abusive = await prisma.abusiveWord.findFirst();

  if (!abusive) {
    abusive = await prisma.abusiveWord.create({
      data: { words: '' } // adjust default fields as needed
    });
  }

  return abusive;
};

const updateAbusive = async (data) => {
  let abusive = await prisma.abusiveWord.findFirst();

  if (!abusive) {
    return prisma.abusiveWord.create({ data });
  }

  return prisma.abusiveWord.update({
    where: { id: abusive.id },
    data,
  });
};

const deleteAbusive = async (id) => {
  return await prisma.abusiveWord.delete({
    where: { id },
  });
};

const getHomepageSettings = async () => {
  // Always get the first homepage settings
  let settings = await prisma.homepageSettings.findFirst();

  // Create default if doesn't exist
  if (!settings) {
    settings = await prisma.homepageSettings.create({
      data: {
        Title: 'Default Homepage',
        Url: '/',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return settings;
};

const updateHomepageSettings = async (data) => {
  // Get existing settings
  let settings = await prisma.homepageSettings.findFirst();

  // Create default if doesn't exist
  if (!settings) {
    return await prisma.homepageSettings.create({
      data: {
        ...data,
        Title: 'Default Homepage',
        Url: '/',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  // Update existing settings
  return await prisma.homepageSettings.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};

const getContactPageSettings = async () => {
  // Always get the first contact page settings
  let settings = await prisma.contactPageSettings.findFirst();

  // Create default if doesn't exist
  if (!settings) {
    settings = await prisma.contactPageSettings.create({
      data: {
        Title: 'Default Contact Page',
        Url: '/contact',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return settings;
};

const updateContactPageSettings = async (data) => {
  // Get existing settings
  let settings = await prisma.contactPageSettings.findFirst();

  // Create default if doesn't exist
  if (!settings) {
    return await prisma.contactPageSettings.create({
      data: {
        ...data,
        Title: 'Default Contact Page',
        Url: '/contact',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  // Update existing settings
  return await prisma.contactPageSettings.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};

const getAgendaPageSettings = async () => {
  let settings = await prisma.agendaPageSettings.findFirst();

  if (!settings) {
    settings = await prisma.agendaPageSettings.create({
      data: {
        Title: 'Events Calendar',
        Url: '/events',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return settings;
};

const updateAgendaPageSettings = async (data) => {
  let settings = await prisma.agendaPageSettings.findFirst();

  if (!settings) {
    return await prisma.agendaPageSettings.create({
      data: {
        ...data,
        Title: 'Events Calendar',
        Url: '/events',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return await prisma.agendaPageSettings.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};
const getVeePageSettings = async () => {
  let settings = await prisma.veePage.findFirst();

  if (!settings) {
    settings = await prisma.veePage.create({
      data: {
        Title: 'Frequently Asked Questions',
        Url: '/faq',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return settings;
};

const updateVeePageSettings = async (data) => {
  let settings = await prisma.veePage.findFirst();

  if (!settings) {
    return await prisma.veePage.create({
      data: {
        ...data,
        Title: 'Frequently Asked Questions',
        Url: '/faq',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return await prisma.veePage.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};
const getHowWorksPageSettings = async () => {
  let settings = await prisma.howWorksPage.findFirst();

  if (!settings) {
    settings = await prisma.howWorksPage.create({
      data: {
        Title: 'How It Works',
        Url: '/how-it-works',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return settings;
};

const updateHowWorksPageSettings = async (data) => {
  let settings = await prisma.howWorksPage.findFirst();

  if (!settings) {
    return await prisma.howWorksPage.create({
      data: {
        ...data,
        Title: 'How It Works',
        Url: '/how-it-works',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return await prisma.howWorksPage.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};



const getTermsPageSettings = async () => {
  let settings = await prisma.termsAndConditionsPageSettings.findFirst();

  if (!settings) {
    settings = await prisma.termsAndConditionsPageSettings.create({
      data: {
        Title: 'Terms & Conditions',
        Url: '/terms',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return settings;
};

const updateTermsPageSettings = async (data) => {
  let settings = await prisma.termsAndConditionsPageSettings.findFirst();

  if (!settings) {
    return await prisma.termsAndConditionsPageSettings.create({
      data: {
        ...data,
        Title: 'Terms & Conditions',
        Url: '/terms',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return await prisma.termsAndConditionsPageSettings.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};


// Registration Page Settings Services
const getRegistrationPageSettings = async () => {
  let settings = await prisma.registrationPageSettings.findFirst();

  if (!settings) {
    settings = await prisma.registrationPageSettings.create({
      data: {
        Title: 'Registration Process',
        Url: '/register',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return settings;
};

const updateRegistrationPageSettings = async (data) => {
  let settings = await prisma.registrationPageSettings.findFirst();

  if (!settings) {
    return await prisma.registrationPageSettings.create({
      data: {
        ...data,
        Title: 'Registration Process',
        Url: '/register',
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
  }

  return await prisma.registrationPageSettings.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};


const createPage = async (data) => {
  // Check if URL exists
  const existingPage = await prisma.page.findFirst({ where: { Url: data.Url } });
  if (existingPage) {
    throw new ApiError(httpStatus.BAD_REQUEST, 'Page URL already exists');
  }

  return await prisma.page.create({
    data: {
      ...data,
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });
};

const getPageById = async (id) => {
  const page = await prisma.page.findUnique({ where: { id: Number(id) } });
  if (!page) throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
  return page;
};

const getPageByUrl = async (url) => {
  const page = await prisma.page.findFirst({ where: { Url: url } });
  if (!page) throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');
  return page;
};

const updatePage = async (id, data) => {
  const page = await prisma.page.findUnique({ where: { id: Number(id) } });
  if (!page) throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');

  // Check URL conflict
  if (data.Url && data.Url !== page.Url) {
    const existing = await prisma.page.findFirst({ where: { Url: data.Url } });
    if (existing) throw new ApiError(httpStatus.BAD_REQUEST, 'Page URL already exists');
  }

  return await prisma.page.update({
    where: { id: Number(id) },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};

const deletePage = async (id) => {
  const page = await prisma.page.findUnique({ where: { id: Number(id) } });
  if (!page) throw new ApiError(httpStatus.NOT_FOUND, 'Page not found');

  await prisma.page.delete({ where: { id: Number(id) } });
};

const listPages = async (filters) => {
  const { pageType, isActive, limit = 10, page = 1 } = filters;
  const skip = (page - 1) * limit;

  const where = {};
  if (pageType) where.pageType = pageType;
  if (isActive !== undefined) where.isActive = isActive;

  const [pages, total] = await Promise.all([
    prisma.page.findMany({
      where,
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' }
    }),
    prisma.page.count({ where })
  ]);

  return {
    pages,
    total,
    page,
    totalPages: Math.ceil(total / limit)
  };
};

const getAllPages = async () => {
  // Fetch all page types
  const [
    homepage,
    contact,
    registration,
    terms,
    howWorks,
    vee,
    agenda,
    customPages
  ] = await Promise.all([
    prisma.homepageSettings.findMany({ where: { isActive: true } }),
    prisma.contactPageSettings.findMany({ where: { isActive: true } }),
    prisma.registrationPageSettings.findMany({ where: { isActive: true } }),
    prisma.termsAndConditionsPageSettings.findMany({ where: { isActive: true } }),
    prisma.howWorksPage.findMany({ where: { isActive: true } }),
    prisma.veePage.findMany({ where: { isActive: true } }),
    prisma.agendaPageSettings.findMany({ where: { isActive: true } }),
    prisma.page.findMany({ where: { isActive: true } })
  ]);

  // Map to unified format
  return [
    ...homepage.map(p => ({ ...p, type: 'homepage' })),
    ...contact.map(p => ({ ...p, type: 'contact' })),
    ...registration.map(p => ({ ...p, type: 'registration' })),
    ...terms.map(p => ({ ...p, type: 'terms' })),
    ...howWorks.map(p => ({ ...p, type: 'how-it-works' })),
    ...vee.map(p => ({ ...p, type: 'vee' })),
    ...agenda.map(p => ({ ...p, type: 'agenda' })),
    ...customPages.map(p => ({ ...p, type: 'custom' }))
  ];
};

const getSystemSettings = async () => {
  let settings = await prisma.preferances.findFirst();

  if (!settings) {
    settings = await prisma.preferances.create({
      data: {
        maintenanceMode: false,
        defaultCurrency: 'EUR',
        defaultLanguage: 'en'
      }
    });
  }

  return settings;
};

const updateSystemSettings = async (data) => {
  let settings = await prisma.preferances.findFirst();

  if (!settings) {
    return await prisma.preferances.create({
      data: {
        ...data,
        maintenanceMode: data.maintenanceMode || false,
        defaultCurrency: data.defaultCurrency || 'EUR',
        defaultLanguage: data.defaultLanguage || 'en'
      }
    });
  }

  return await prisma.preferances.update({
    where: { id: settings.id },
    data: {
      ...data,
      updatedAt: new Date()
    }
  });
};


const getFooter = async () => {
  let footer = await prisma.footerSettings.findFirst({
    include: { sections: true }
  });

  if (!footer) {
    // create default if not exists
    footer = await prisma.footerSettings.create({
      data: {},
      include: { sections: true }
    });
  }

  return footer;
};

const updateFooter = async (data) => {
  const existing = await prisma.footerSettings.findFirst();

  if (!existing) {
    return prisma.footerSettings.create({
      data,
      include: { sections: true }
    });
  }

  return prisma.footerSettings.update({
    where: { id: existing.id },
    data,
    include: { sections: true }
  });
};

const createSection = async (data) => {
  const footer = await prisma.footerSettings.findFirst();
  if (!footer) throw new ApiError(httpStatus.NOT_FOUND, "Footer not found");

  return prisma.footerSection.create({
    data: {
      ...data,
      footerId: footer.id
    }
  });
};

const updateSection = async (id, data) => {
  const section = await prisma.footerSection.findUnique({ where: { id } });
  if (!section) throw new ApiError(httpStatus.NOT_FOUND, "Section not found");

  return prisma.footerSection.update({
    where: { id },
    data
  });
};




const getSectionById = async (id, data) => {
  const section = await prisma.footerSection.findUnique({ where: { id } });
  if (!section) throw new ApiError(httpStatus.NOT_FOUND, "Section not found");
  return section;
 
};


const getSection = async (id, data) => {
  const section = await prisma.footerSection.findMany();
  if (!section) throw new ApiError(httpStatus.NOT_FOUND, "Section not found");
  return section;
 
};
const deleteSection = async (id) => {
  const section = await prisma.footerSection.findUnique({ where: { id } });
  if (!section) throw new ApiError(httpStatus.NOT_FOUND, "Section not found");

  return prisma.footerSection.delete({ where: { id } });
};

const getUserDashboards = async () => {
  let dashboard = await prisma.userDashoard.findFirst();

  if (!dashboard) {
    dashboard = await prisma.userDashoard.create({
      data: { sectionPage: '' } // or use a default value
    });
  }

  return dashboard;
};

const updateUserDashboardById = async (data) => {
  const existing = await prisma.userDashoard.findFirst();
  if (!existing) {
    return prisma.userDashoard.create({ data });
  }
  return prisma.userDashoard.update({
    where: { id: existing.id },
    data
  });
};

const createOrUpdateTranslation = async ({ key, languageCode, text }) => {
  const language = await prisma.language.findUnique({
    where: { code: languageCode },
  });
  if (!language) throw new ApiError(httpStatus.BAD_REQUEST,"Language not found");

  return prisma.translation.upsert({
    where: { key_languageId: { key, languageId: language.id } },
    update: { text },
    create: { key, text, languageId: language.id },
  });
};

/**
 * Get translation by language code and key
 */
const getTranslationByCodeAndKey = async ({ languageCode, key }) => {
  const language = await prisma.language.findUnique({
    where: { code: languageCode },
  });
  if (!language) throw new ApiError(httpStatus.BAD_REQUEST,"Language not found");

  const translation = await prisma.translation.findUnique({
    where: { key_languageId: { key, languageId: language.id } },
  });
  if (!translation) throw ApiError(httpStatus.BAD_REQUEST,"translation not found");

  return translation;
};

/**
 * Update translation by language code and key
 */
const updateTranslationByCodeAndKey = async ({ languageCode, key, text }) => {
  const language = await prisma.language.findUnique({
    where: { code: languageCode },
  });
  if (!language) throw new ApiError(httpStatus.BAD_REQUEST,"Language not found");

  return prisma.translation.update({
    where: { key_languageId: { key, languageId: language.id } },
    data: { text },
  });
};

/**
 * Get all translations for a language
 */
const getAllTranslationsByLanguage = async (languageCode) => {
  const language = await prisma.language.findUnique({
    where: { code: languageCode },
  });
  if (!language) throw new ApiError(httpStatus.BAD_REQUEST,"Language not found");

  return prisma.translation.findMany({
    where: { languageId: language.id },
  });
};




// const getAllTranslationsByLanguageCode = async (languageCode) => {
//   const language = await prisma.language.findUnique({
//     where: { code: languageCode },
//   });

//   if (!language) throw new ApiError(httpStatus.BAD_REQUEST,"Language not found");

//   const translations = await prisma.translation.findMany({
//     where: { languageId: language.id },
//     select: { key: true, text: true }
//   });

//   // Return as an object { key: "translation text" }
//   return translations.reduce((acc, t) => {
//     acc[t.key] = t.text;
//     return acc;
//   }, {});
// };


// const getAllTranslationsByLanguageCode = async (languageCode, search,all=false, page = 1, limit = 10) => {
//   const language = await prisma.language.findUnique({
//     where: { code: languageCode },
//   });

//   if (!language) {
//     throw new ApiError(httpStatus.BAD_REQUEST, "Language not found");
//   }

//   const skip = (page - 1) * limit;

//   const whereClause = {
//     languageId: language.id,
//     ...(search && {
//       OR: [
//         { key: { contains: search } },
//         { text: { contains: search } }
//       ]
//     })
//   };

//   const [translations, total] = await Promise.all([
//     prisma.translation.findMany({
//       where: whereClause,
//       select: { key: true, text: true },
//       skip,
//       take: limit,
//       orderBy: { createdAt: "desc" }
//     }),
//     prisma.translation.count({ where: whereClause })
//   ]);

//   return {
//     languageCode: languageCode,
//     language:language.name,
//     translations: translations.reduce((acc, t) => {
//       acc[t.key] = t.text;
//       return acc;
//     }, {}),
//     pagination: {
//       total,
//       page,
//       limit,
//       totalPages: Math.ceil(total / limit)
//     }
//   };
// };


const getAllTranslationsByLanguageCode = async (
  languageCode,
  search,
  all = false,
  page = 1,
  limit = 10
) => {
  const language = await prisma.language.findUnique({
    where: { code: languageCode },
  });

  if (!language) {
    throw new ApiError(httpStatus.BAD_REQUEST, "Language not found");
  }

  const whereClause = {
    languageId: language.id,
    ...(search && {
      OR: [
        { key: { contains: search, mode: "insensitive" } },
        { text: { contains: search, mode: "insensitive" } },
      ],
    }),
  };

  // if "all" is true, fetch everything without pagination
  const [translations, total] = await Promise.all([
    prisma.translation.findMany({
      where: whereClause,
      select: { key: true, text: true },
      orderBy: { createdAt: "desc" },
      ...(all ? {} : { skip: (page - 1) * limit, take: limit }),
    }),
    prisma.translation.count({ where: whereClause }),
  ]);

  return {
    languageCode,
    language: language.name,
    translations: translations.reduce((acc, t) => {
      acc[t.key] = t.text;
      return acc;
    }, {}),
    pagination: all
      ? null
      : {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
  };
};

const updateMultipleTranslationsByLanguageCode = async (languageCode, translations) => {
  const language = await prisma.language.findUnique({
    where: { code: languageCode },
  });

  if (!language) throw new ApiError(httpStatus.BAD_REQUEST, "Language not found");

  // Get existing keys for the given language
  const existingTranslations = await prisma.translation.findMany({
    where: { languageId: language.id },
    select: { key: true }
  });

  const existingKeys = existingTranslations.map(t => t.key);

  // Only update keys that exist
  const updates = Object.entries(translations)
    .filter(([key]) => existingKeys.includes(key))
    .map(([key, value]) =>
      prisma.translation.update({
        where: { key_languageId: { key, languageId: language.id } },
        data: { text:value },
      })
    );

  if (updates.length > 0) {
    await prisma.$transaction(updates);
  }

  return { updated: updates.length, skipped: Object.keys(translations).length - updates.length };
};


const incrementOrCreate = async (pageLink) => {
  const existing = await prisma.pageView.findUnique({
    where: { pageLink }
  });

  if (existing) {
    return prisma.pageView.update({
      where: { pageLink },
      data: { count: { increment: 1 } }
    });
  }

  return prisma.pageView.create({
    data: {
      pageLink,
      count: 1
    }
  });
};


module.exports = {
  getEmailSentCount,
  getSection,
  getSectionById,
  incrementOrCreate,
  updateMultipleTranslationsByLanguageCode,
  getAllTranslationsByLanguageCode,
  getAllTranslationsByLanguage,
  createOrUpdateTranslation,
  getTranslationByCodeAndKey,
  updateTranslationByCodeAndKey,
  getUserDashboards,
  updateUserDashboardById,
  getFooter,
  updateFooter,
  createSection,
  updateSection,
  deleteSection,
  getSystemSettings,
  updateSystemSettings,
  getAllPages,
  createPage,
  getPageById,
  getPageByUrl,
  updatePage,
  deletePage,
  listPages,
  getRegistrationPageSettings,
  updateRegistrationPageSettings,
  getTermsPageSettings,
  updateTermsPageSettings,
  getHowWorksPageSettings,
  updateHowWorksPageSettings,
  getVeePageSettings,
  updateVeePageSettings,
  getAgendaPageSettings,
  updateAgendaPageSettings,
  getContactPageSettings,
  updateContactPageSettings,
  getHomepageSettings,
  updateHomepageSettings,
  getBasicSettings,
  updateBasicSettings,
  createCookieSettings,
  getCookieSettings,
  updateCookieSettings,
  createSeoSettings,
  getSeoSettings,
  updateSeoSettings,
  createEmailTemplate,
  getEmailTemplate,
  updateEmailTemplate,
  getAllEmailTemplates,
  createLanguage,
  getLanguages,
  updateLanguage,
  deleteLanguage,
  updateCredSetting,
  getCredSetting,
  createCurrency,
  getAllCurrencies,
  updateCurrency,
  deleteCurrency,
  getCurrencySetting,
  updateCurrencySetting,
  createAbusive,
  getAllAbusive,
  updateAbusive,
  deleteAbusive,
};