const Joi = require("joi");

const createChatSettings = {
  body: Joi.object({
    messageLength: Joi.number().optional(),
    displayName: Joi.string().optional(),
    enableImages: Joi.boolean().optional(),
    enableVideos: Joi.boolean().optional(),
    enableFiles: Joi.boolean().optional(),
    fileExtensions: Joi.string().optional(),
    fileSizeLimit: Joi.number().optional(),
    noticeStyle: Joi.string().optional(),
    pageNoticeMessage: Joi.string().optional(),
  }),
};

const updateChatSettings = {
  body: Joi.object({
    messageLength: Joi.number().optional(),
    displayName: Joi.string().optional(),
    enableImages: Joi.boolean().optional(),
    enableVideos: Joi.boolean().optional(),
    enableFiles: Joi.boolean().optional(),
    fileExtensions: Joi.string().optional(),
    fileSizeLimit: Joi.number().optional(),
    noticeStyle: Joi.string().optional(),
    pageNoticeMessage: Joi.string().optional(),
  }).min(1),
};

module.exports = {
  createChatSettings,
  updateChatSettings,
};
