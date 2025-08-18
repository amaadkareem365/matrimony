const express = require("express");
const authRoute = require("./auth.route.js");
const userRoute = require("./users.route.js");
const profileAttributeRoute = require("./profileAttribute.route.js");
const faqRoute = require("./faq.route.js");
const blogRoute = require("./blog.route.js");
const packageRoute = require("./package.route.js");
const newsletterRoute = require("./newsletter.route.js");
const bannerRoute = require("./banner.route.js");
const chatSettingsRoute = require("./chatSettings.route.js");
const chatRoute = require("./chat.route.js");
const messageRoute = require("./message.route.js");
const basicSettingRoute = require("./basicSetting.route.js");
const notificationSettingRoute = require("./notificationSettings.route.js")
const paymentRoute = require("./payment.route.js")
const { path } = require("../../app.js");
const router = express.Router();


const defaultRoutes = [
  {
    path: "/auth",
    route: authRoute,
  },
   {
    path: "/payment",
    route: paymentRoute,
  },
   {
    path: "/message",
    route: messageRoute,
  },
   {
    path: "/users",
    route: userRoute,
  },
   {
    path: "/profile-attribute",
    route: profileAttributeRoute,
  },
   {
    path: "/faq",
    route: faqRoute,
  },
   {
    path: "/blog",
    route: blogRoute,
  },
   {
    path: "/package",
    route: packageRoute,
  },
   {
    path: "/newsletter",
    route: newsletterRoute,
  },
  {
    path: "/banner",
    route: bannerRoute,
  },

  {
    path: "/chat-setting",
    route: chatSettingsRoute,
  },
    {
    path: "/setting",
    route: basicSettingRoute,
  },
  {
    path: "/notification-settings",
    route: notificationSettingRoute,
  },
  {
    path: "/chat",
    route: chatRoute,
  }
 
];

defaultRoutes.forEach((route) => {
  router.use(route.path, route.route);
});

module.exports = router;
