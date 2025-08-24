const httpStatus = require("http-status");
const catchAsync = require("../utils/catchAsync");
const settingsService = require("../services/basicSettings.service");

const createBasicSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.createBasicSettings(req.body);
    res.status(httpStatus.CREATED).send(settings);
});

const getBasicSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getBasicSettings(req.params.id);
    res.send(settings);
});

const updateBasicSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateBasicSettings(req.body);
    res.send(settings);
});


const createCookieSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.createCookieSettings(req.body);
    res.status(httpStatus.CREATED).send(settings);
});

const getCookieSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getCookieSettings();
    res.send(settings);
});

const updateCookieSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateCookieSettings(req.body);
    res.send(settings);
});


const createSeoSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.createSeoSettings(req.body);
    res.status(httpStatus.CREATED).send(settings);
});

const getSeoSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getSeoSettings();
    res.send(settings);
});

const updateSeoSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateSeoSettings(req.body);
    res.send(settings);
});


const createEmailTemplate = catchAsync(async (req, res) => {
    const template = await settingsService.createEmailTemplate(req.body);
    res.status(httpStatus.CREATED).send(template);
});

const getEmailTemplate = catchAsync(async (req, res) => {
    const template = await settingsService.getEmailTemplate(req.params.id);
    res.send(template);
});

const updateEmailTemplate = catchAsync(async (req, res) => {
    const template = await settingsService.updateEmailTemplate(req.params.id, req.body);
    res.send(template);
});
const getAllEmailTemplates = catchAsync(async (req, res) => {
    const templates = await settingsService.getAllEmailTemplates();
    const stats = await settingsService.getEmailSentCount();
    res.send({templates,stats});
});


const createLanguage = catchAsync(async (req, res) => {
    const language = await settingsService.createLanguage(req.body);
    res.status(httpStatus.CREATED).send(language);
});

const getLanguages = catchAsync(async (req, res) => {
    const langs = await settingsService.getLanguages();
    res.send(langs);
});

const updateLanguage = catchAsync(async (req, res) => {
    const updated = await settingsService.updateLanguage(req.params.languageId, req.body);
    res.send(updated);
});

const deleteLanguage = catchAsync(async (req, res) => {
    await settingsService.deleteLanguage(req.params.languageId);
    res.status(httpStatus.NO_CONTENT).send();
});



const updateGenericSetting = (modelName) =>
    catchAsync(async (req, res) => {
        const setting = await settingsService.updateCredSetting(modelName, req.body);
        res.status(httpStatus.OK).json(setting);
    });

const getGenericSetting = (modelName) =>
    catchAsync(async (req, res) => {
        const setting = await settingsService.getCredSetting(modelName);
        res.status(httpStatus.OK).json(setting);
    });
const getAllCurrencies = catchAsync(async (req, res) => {
    const all = await settingsService.getAllCurrencies();
    res.status(200).json(all);
});

const createCurrency = catchAsync(async (req, res) => {
    const currency = await settingsService.createCurrency(req.body);
    res.status(201).json(currency);
});

const updateCurrency = catchAsync(async (req, res) => {
    const id = req.params.id
    const updated = await settingsService.updateCurrency(+id, req.body);
    res.status(200).json(updated);
});

const deleteCurrency = catchAsync(async (req, res) => {
    const { id } = req.params;
    await settingsService.deleteCurrency(parseInt(id));
    res.status(200).send({
        message: "currency delted"
    });
});

const getCurrencySetting = catchAsync(async (req, res) => {
    const setting = await settingsService.getCurrencySetting();
    res.status(200).json(setting);
});

const updateCurrencySetting = catchAsync(async (req, res) => {
    const setting = await settingsService.updateCurrencySetting(req.body);
    res.status(200).json(setting);
});



const getAllAbusive = catchAsync(async (req, res) => {
    const words = await settingsService.getAllAbusive();
    res.status(200).json(words);
});



const updateAbusive = catchAsync(async (req, res) => {
    const updated = await settingsService.updateAbusive(req.body);
    res.status(200).json(updated);
});



const getHomepageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getHomepageSettings();
    res.send(settings);
});

const updateHomepageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateHomepageSettings(req.body);
    res.send(settings);
});

const getContactPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getContactPageSettings();
    res.send(settings);
});

const updateContactPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateContactPageSettings(req.body);
    res.send(settings);
});
const getAgendaPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getAgendaPageSettings();
    res.send(settings);
});

const updateAgendaPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateAgendaPageSettings(req.body);
    res.send(settings);
});
const getVeePageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getVeePageSettings();
    res.send(settings);
});

const updateVeePageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateVeePageSettings(req.body);
    res.send(settings);
});

const getHowWorksPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getHowWorksPageSettings();
    res.send(settings);
});

const updateHowWorksPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateHowWorksPageSettings(req.body);
    res.send(settings);
});

const getTermsPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getTermsPageSettings();
    res.send(settings);
});

const updateTermsPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateTermsPageSettings(req.body);
    res.send(settings);
});

const getRegistrationPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getRegistrationPageSettings();
    res.send(settings);
});

const updateRegistrationPageSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateRegistrationPageSettings(req.body);
    res.send(settings);
});

const createPageSettings = catchAsync(async (req, res) => {
    const page = await settingsService.createPage(req.body);
    res.status(httpStatus.CREATED).send(page);
});

const getPageSettings = catchAsync(async (req, res) => {
    const page = await settingsService.getPageById(req.params.id);
    res.send(page);
});

const getPageByUrlSettings = catchAsync(async (req, res) => {
    const page = await settingsService.getPageByUrl(req.query.url);
    res.send(page);
});

const updatePageSettings = catchAsync(async (req, res) => {
    const page = await settingsService.updatePage(req.params.id, req.body);
    res.send(page);
});

const deletePageSettings = catchAsync(async (req, res) => {
    await settingsService.deletePage(req.params.id);
    res.status(httpStatus.OK).send({
        message: "deleted successfully"
    });
});

const listPagesSettings = catchAsync(async (req, res) => {
    const result = await settingsService.listPages(req.query);
    res.send(result);
});

const getAllPages = catchAsync(async (req, res) => {
    const pages = await settingsService.getAllPages();
    res.send(pages);
});

const getSystemSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.getSystemSettings();
    res.send(settings);
});

const updateSystemSettings = catchAsync(async (req, res) => {
    const settings = await settingsService.updateSystemSettings(req.body);
    res.send(settings);
});


const getFooter = catchAsync(async (req, res) => {
    const footer = await settingsService.getFooter();
    res.status(httpStatus.OK).send(footer);
});

const updateFooter = catchAsync(async (req, res) => {
    const updated = await settingsService.updateFooter(req.body);
    res.status(httpStatus.OK).send(updated);
});

const createSection = catchAsync(async (req, res) => {
    const section = await settingsService.createSection(req.body);
    res.status(httpStatus.CREATED).send(section);
});

const updateSection = catchAsync(async (req, res) => {
    const section = await settingsService.updateSection(parseInt(req.params.id), req.body);
    res.status(httpStatus.OK).send(section);
});


const getSectionById = catchAsync(async (req, res) => {
    const section = await settingsService.getSectionById(parseInt(req.params.id));
    res.status(httpStatus.OK).send(section);
});

const getSection = catchAsync(async (req, res) => {
    const section = await settingsService.getSection();
    res.status(httpStatus.OK).send(section);
});


const deleteSection = catchAsync(async (req, res) => {
    await settingsService.deleteSection(parseInt(req.params.id));
    res.status(httpStatus.NO_CONTENT).send();
});

const getAllUserDashboards = async (req, res) => {
    const dashboards = await settingsService.getUserDashboards();
    res.status(200).json({ success: true, data: dashboards });
};

const patchUserDashboard = async (req, res) => {
    const updated = await settingsService.updateUserDashboardById(req.body);
    res.status(200).json({ success: true, data: updated });
};
const createTranslation = async (req, res) => {
    try {
        const { key, languageCode, text } = req.body;
        const translation = await settingsService.createOrUpdateTranslation({
            key,
            languageCode,
            text,
        });
        res.json(translation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * GET /translation/:languageCode/:key
 */
const getTranslationByCodeAndKey = async (req, res) => {
    try {
        const { languageCode, key } = req.params;
        const translation = await settingsService.getTranslationByCodeAndKey({
            languageCode,
            key,
        });
        res.json(translation);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

/**
 * PUT /translation/:languageCode/:key
 */
const updateTranslationByCodeAndKey = async (req, res) => {
    try {
        const { languageCode, key } = req.params;
        const { text } = req.body;
        const updatedTranslation =
            await settingsService.updateTranslationByCodeAndKey({
                languageCode,
                key,
                text,
            });
        res.json(updatedTranslation);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

/**
 * GET /translations/:languageCode
 */
const getAllTranslationsByLanguage = async (req, res) => {
    try {
        const { languageCode } = req.params;
        const translations = await settingsService.getAllTranslationsByLanguage(
            languageCode
        );
        res.json(translations);
    } catch (error) {
        res.status(404).json({ error: error.message });
    }
};

const getAllTranslationsByLanguageCode = async (req, res, next) => {
    try {
        const { languageCode } = req.params;
        const { search, page, limit ,all } = req.query;
        const translations = await settingsService.getAllTranslationsByLanguageCode(languageCode,
            search,
           all === "true", // pass as boolean
            Number(page) || 1,
            Number(limit) || 10);

        res.status(200).json({
            translations
        });
    } catch (error) {
        next(error);
    }
};


const updateMultipleTranslationsByLanguageCode = async (req, res, next) => {
    try {
        const { languageCode } = req.params;
        const { translations } = req.body; // { key: text, key2: text2 }

        const keys = await settingsService.updateMultipleTranslationsByLanguageCode(languageCode, translations);

        res.status(200).json({ message: "Translations updated successfully", keys });
    } catch (error) {
        next(error);
    }
};


const incrementPageView = async (req, res) => {
    try {
        const { pageLink } = req.body;

        if (!pageLink) {
            return res.status(400).json({ message: 'pageLink is required' });
        }

        const updatedPageView = await settingsService.incrementOrCreate(pageLink);

        return res.status(200).json({
            message: 'Page view updated successfully',
            data: updatedPageView
        });
    } catch (error) {
        console.error('Error incrementing page view:', error);
        return res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = {
    getSection,
    getSectionById,
    incrementPageView,
    updateMultipleTranslationsByLanguageCode,
    getAllTranslationsByLanguageCode,
    createTranslation,
    getTranslationByCodeAndKey,
    updateTranslationByCodeAndKey,
    getAllTranslationsByLanguage,
    getAllUserDashboards,
    patchUserDashboard,
    getFooter,
    updateFooter,
    createSection,
    updateSection,
    deleteSection,
    getSystemSettings,
    updateSystemSettings,
    getAllPages,
    createPageSettings,
    getPageSettings,
    getPageByUrlSettings,
    updatePageSettings,
    deletePageSettings,
    listPagesSettings,
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
    createBasicSettings,
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
    getAllCurrencies,
    createCurrency,
    updateCurrency,
    deleteCurrency,
    getCurrencySetting,
    updateCurrencySetting,
    updateGoogleLogin: updateGenericSetting('googleLoginSettings'),
    getGoogleLogin: getGenericSetting('googleLoginSettings'),
    updateFacebookLogin: updateGenericSetting('facebookLoginSettings'),
    getFacebookLogin: getGenericSetting('facebookLoginSettings'),
    updateRecaptcha: updateGenericSetting('recaptchaSettings'),
    getRecaptcha: getGenericSetting('recaptchaSettings'),
    updateMollie: updateGenericSetting('mollieSettings'),
    getMollie: getGenericSetting('mollieSettings'),
    updateStripe: updateGenericSetting('stripeSettings'),
    getStripe: getGenericSetting('stripeSettings'),
    updateSMTP: updateGenericSetting('sMTPSettings'),
    getSMTP: getGenericSetting('sMTPSettings'),
    updatePush: updateGenericSetting('pushNotificationSettings'),
    getPush: getGenericSetting('pushNotificationSettings'),
    getAllAbusive,
    updateAbusive,
};
