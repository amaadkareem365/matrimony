const Joi = require("joi");

const createNewsletter = {
  body: Joi.object({
    title: Joi.string().required(),
    content: Joi.string().required(),
    emails: Joi.string()
      .required()
      .custom((value, helpers) => {
        const emailList = value.split(",").map((e) => e.trim());
        const isValid = emailList.every((email) =>
          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
        );
        if (!isValid) return helpers.message("One or more emails are invalid");
        return value;
      }),
  }),
};



module.exports = {
  createNewsletter
};
