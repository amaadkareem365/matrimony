const { text } = require("express");
const prisma = require("../utils/db");
const sgMail = require("@sendgrid/mail");
sgMail.setApiKey(process.env.SENDGRID_API_KEY);
const he = require("he");


const executeWithCatch = async (asyncFn) => {
  try {
    await asyncFn();
  } catch (error) {
    console.error(`Error occurred: ${error.message}`);
  }
};

const sendEmail = async (to, subject,html) => {
  const msg = {
    from: process.env.SENDGRID_FROM_EMAIL,
    to,
    subject,
    html: html ,
  };
  
  await executeWithCatch(async () => {
    const res = await sgMail.send(msg);
    console.log(`Notification sent to ${to}`, res);
  });
};
const sendProfileVisitEmail = async ( recipientId, visitorId ) => {
    // Fetch recipient and visitor
    const recipient = await prisma.user.findUnique({
        where: { id: recipientId },
        include: { activeLanguage: true },
    });

    const visitor = await prisma.user.findUnique({
        where: { id: visitorId },
    });

    if (!recipient?.email) return;

    // Get active language (fallback 'en')
    const lang = recipient.activeLanguage?.name || 'English';
    
    // Fetch the template
    const template = await prisma.emailTemplate.findUnique({
        where: { key: 'profile_view_notification' },
        include: { translations: true },
    });

    if (!template || !template.isActive) return;

    const translation =
        template.translations.find((t) => t.language === lang) ||
        template.translations.find((t) => t.language === 'English'); // fallback

    if (!translation) return;

    // Replace placeholders
    const subject = translation.subject
        .replace('[[recipientName]]', recipient.firstName || recipient.username || 'User')
        .replace('[[name]]', visitor.firstName || visitor.username || 'Someone')
        .replace('[[appName]]', process.env.APP_NAME || 'Our App');

    const rawContent  = translation.content
        .replace('[[recipientName]]', recipient.firstName || recipient.username || 'User')
        .replace('[[name]]', visitor.firstName || visitor.username || 'Someone')
        .replace('[[appName]]', process.env.APP_NAME || 'Our App');
    // Send the email
    const content = he.decode(rawContent);
    console.log(content)
    await sendEmail(
         recipient.email,
        subject,
        content,
    );
};

const sendLikeAcceptedEmail = async ( senderId, receiverId ) => {
  // Fetch sender & receiver
  const sender = await prisma.user.findUnique({
    where: { id: senderId },
    include: { activeLanguage: true },
  });

  const receiver = await prisma.user.findUnique({
    where: { id: receiverId },
  });

  if (!sender?.email) return;

  const lang = sender.activeLanguage?.name || "English";

  // Fetch template from DB
  const template = await prisma.emailTemplate.findUnique({
    where: { key: "interest_accepted" },
    include: { translations: true },
  });

  if (!template || !template.isActive) return;

  const translation =
    template.translations.find((t) => t.language === lang) ||
    template.translations.find((t) => t.language === "English"); // fallback

  if (!translation) return;

  // Replace placeholders
  let rawContent = translation.content
    .replace(
      "[[senderName]]",
      sender.firstName || sender.username || "User"
    )
    .replace(
      "[[receiverName]]",
      receiver.firstName || receiver.username || "Someone"
    )
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const subject = translation.subject
    .replace(
      "[[senderName]]",
      sender.firstName || sender.username || "User"
    )
    .replace(
      "[[receiverName]]",
      receiver.firstName || receiver.username || "Someone"
    )
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  // Decode any escaped HTML
  const content = he.decode(rawContent);

  // Send HTML email only
  await sendEmail(sender.email, subject, content);
};

const sendPhotoRequestEmail = async ( requesterId, targetId ) => {
  const target = await prisma.user.findUnique({
    where: { id: targetId },
    include: { activeLanguage: true },
  });

  const requester = await prisma.user.findUnique({
    where: { id: requesterId },
  });

  if (!target?.email) return;

  const lang = target.activeLanguage?.name || "English";

  // Fetch template from DB
  const template = await prisma.emailTemplate.findUnique({
    where: { key: "photo_request" },
    include: { translations: true },
  });

  if (!template || !template.isActive) return;

  const translation =
    template.translations.find((t) => t.language === lang) ||
    template.translations.find((t) => t.language === "English"); // fallback

  if (!translation) return;

  // Replace placeholders
  let rawContent = translation.content
    .replace("[[targetName]]", target.firstName || target.username || "User")
    .replace("[[requesterName]]", requester.firstName || requester.username || "Someone")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const subject = translation.subject
    .replace("[[targetName]]", target.firstName || target.username || "User")
    .replace("[[requesterName]]", requester.firstName || requester.username || "Someone")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  // Decode any escaped HTML entities
  const content = he.decode(rawContent);

  // Send email (HTML only, since template can hold HTML)
  await sendEmail(target.email, subject, content);
};


const sendPackagePurchaseEmail = async ( userId, packageId, startDate, endDate, price ) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { activeLanguage: true },
  });

  const pkg = await prisma.package.findUnique({
    where: { id: packageId },
  });

  if (!user?.email) return;

  const lang = user.activeLanguage?.name || "English";

  const template = await prisma.emailTemplate.findUnique({
    where: { key: "package_purchase_confirmation" },
    include: { translations: true },
  });

  if (!template || !template.isActive) return;

  const translation =
    template.translations.find((t) => t.language === lang) ||
    template.translations.find((t) => t.language === "English");

  if (!translation) return;

  // Replace placeholders
  let rawContent = translation.content
    .replace("[[userName]]", user.firstName || user.username || "User")
    .replace("[[packageName]]", pkg?.name || "Premium")
    .replace("[[appName]]", process.env.APP_NAME || "Our App")
    .replace("[[startDate]]", startDate.toDateString())
    .replace("[[endDate]]", endDate.toDateString())
    .replace("[[price]]", `${price} ${process.env.CURRENCY || "USD"}`);

  const subject = translation.subject
    .replace("[[userName]]", user.firstName || user.username || "User")
    .replace("[[packageName]]", pkg?.name || "Premium")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const content = he.decode(rawContent);
   const existing = await prisma.emailSentCount.findFirst({
        where: { id: 1 },
    });
    if (existing) {
        await prisma.emailSentCount.update({
            where: { id: 1 },
            data: { orderConfirmation: { increment: 1 } },
        });
    } else {
        await prisma.emailSentCount.create({
            data: { id: 1, orderConfirmation: 1 },
        });
    }
  await sendEmail(user.email, subject, content);
};
const sendPackageExpiryWarningEmail = async ( userId ) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { activeLanguage: true },
  });

  if (!user?.email || !user.packageEnd) return;

  const lang = user.activeLanguage?.name || "English";

  const template = await prisma.emailTemplate.findUnique({
    where: { key: "vip_package_expiry_warning" },
    include: { translations: true },
  });

  if (!template || !template.isActive) return;

  const translation =
    template.translations.find((t) => t.language === lang) ||
    template.translations.find((t) => t.language === "English");

  if (!translation) return;

  const expiryDate = new Date(user.packageEnd).toDateString();

  const subject = translation.subject
    .replace("[[userName]]", user.firstName || user.username || "User")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const rawContent = translation.content
    .replace("[[userName]]", user.firstName || user.username || "User")
    .replace("[[appName]]", process.env.APP_NAME || "Our App")
    .replace("[[expiryDate]]", expiryDate);

  const content = he.decode(rawContent);

  await sendEmail(user.email, subject, content);
};


const sendOtpEmail = async (userId, otp ) => {
  const user = await prisma.user.findUnique({
    where: { id: +userId },
    include: { activeLanguage: true },
  });

  if (!user?.email) return;

  const lang = user.activeLanguage?.name || "English";

  const template = await prisma.emailTemplate.findUnique({
    where: { key: "otp_activation" },
    include: { translations: true },
  });

  if (!template || !template.isActive) return;

  const translation =
    template.translations.find((t) => t.language === lang) ||
    template.translations.find((t) => t.language === "English");

  if (!translation) return;

  const subject = translation.subject
    .replace("[[firstName]]", user.firstName || user.username || "User")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const rawContent = translation.content
    .replace("[[firstName]]", user.firstName || user.username || "User")
    .replace("[[otp]]", otp)
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const content = he.decode(rawContent);

  await sendEmail(user.email, subject, content);
};


const sendAccountDeletionEmail = async ( userId ) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { activeLanguage: true },
  });

  if (!user?.email) return;

  const lang = user.activeLanguage?.name || "English";

  const template = await prisma.emailTemplate.findUnique({
    where: { key: "account_deletion_confirmation" }, // 👈 use correct template key
    include: { translations: true },
  });

  if (!template || !template.isActive) return;

  const translation =
    template.translations.find((t) => t.language === lang) ||
    template.translations.find((t) => t.language === "English");

  if (!translation) return;

  const subject = translation.subject
    .replace("[[firstName]]", user.firstName || user.username || "User")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const rawContent = translation.content
    .replace("[[firstName]]", user.firstName || user.username || "User")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const content = he.decode(rawContent);

  await sendEmail(user.email, subject, content);
};

const sendWelcomeEmail = async ( userId ) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { activeLanguage: true },
    });

    if (!user?.email) return;

    const lang = user.activeLanguage?.name || "English";

    const template = await prisma.emailTemplate.findUnique({
        where: { key: "welcome_after_activation" },
        include: { translations: true },
    });

    if (!template || !template.isActive) return;

    const translation =
        template.translations.find((t) => t.language === lang) ||
        template.translations.find((t) => t.language === "English");

    if (!translation) return;

    const subject = translation.subject
        .replace("[[firstName]]", user.firstName || user.username || "User")
        .replace("[[appName]]", process.env.APP_NAME || "Our App");

    const rawContent = translation.content
        .replace("[[firstName]]", user.firstName || user.username || "User")
        .replace("[[appName]]", process.env.APP_NAME || "Our App");

    const content = he.decode(rawContent);
       const existing = await prisma.emailSentCount.findFirst({
        where: { id: 1 },
    });
    if (existing) {
        await prisma.emailSentCount.update({
            where: { id: 1 },
            data: { welcomeEmail: { increment: 1 } },
        });
    } else {
        await prisma.emailSentCount.create({
            data: { id: 1, welcomeEmail: 1 },
        });
    }
    await sendEmail(user.email, subject, content);

    // Upsert EmailSentCount for welcomeEmail
    // System-wide (single row with id = 1)
 
};

const sendAccountCreatedByAdminEmail = async ( userId, password ) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { activeLanguage: true },
  });

  if (!user?.email) return;

  const lang = user.activeLanguage?.name || "English";

  // Fetch template from DB
  const template = await prisma.emailTemplate.findUnique({
    where: { key: "admin_register_member" }, // <-- make sure you seed this key
    include: { translations: true },
  });

  if (!template || !template.isActive) return;

  // Pick correct translation (fallback: English)
  const translation =
    template.translations.find((t) => t.language === lang) ||
    template.translations.find((t) => t.language === "English");

  if (!translation) return;

  // Subject replacement
  const subject = translation.subject
    .replace("[[firstName]]", user.firstName || user.username || "User")
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  // Content replacement
  const rawContent = translation.content
    .replace("[[firstName]]", user.firstName || user.username || "User")
    .replace("[[email]]", user.email)
    .replace("[[password]]", password)
    .replace("[[appName]]", process.env.APP_NAME || "Our App");

  const content = he.decode(rawContent);

  await sendEmail(user.email, subject, content);
};

const notifyAdminsNewTicket = async (ticket) => {
    // Fetch all admins
    const admins = await prisma.user.findMany({
        where: { role: "ADMIN", email: { not: null } },
    });

    if (!admins.length) return;

    // Load template
    const template = await prisma.emailTemplate.findUnique({
        where: { key: "user_inquiry" },
        include: { translations: true },
    });

    if (!template || !template.isActive) return;

    for (const admin of admins) {
        const lang = admin?.activeLanguage?.name || "English";

        const translation =
            template.translations.find((t) => t.language === lang) ||
            template.translations.find((t) => t.language === "English");

        if (!translation) continue;

        const subject = translation.subject
            .replace("[[ticketSubject]]", ticket.subject)
            .replace("[[username]]", ticket.user.firstName || ticket.user.username || "User")
            .replace("[[appName]]", process.env.APP_NAME || "Our App");

        const rawContent = translation.content
            .replace("[[ticketSubject]]", ticket.subject)
            .replace("[[ticketCategory]]", ticket.category)
            .replace("[[ticketPriority]]", ticket.priority)
            .replace("[[ticketDescription]]", ticket.description)
            .replace("[[username]]", ticket.user.firstName || ticket.user.username || "User")
            .replace("[[appName]]", process.env.APP_NAME || "Our App");

        const content = he.decode(rawContent);

        await sendEmail(admin.email, subject, content);
    }
};

const sendForgotPasswordEmail = async ( userId, resetPasswordToken ) => {
    const user = await prisma.user.findUnique({
        where: { id: userId },
        include: { activeLanguage: true },
    });

    if (!user?.email) return;

    const lang = user.activeLanguage?.name || "English";

    const template = await prisma.emailTemplate.findUnique({
        where: { key: "forgot_password" },
        include: { translations: true },
    });

    if (!template || !template.isActive) return;

    const translation =
        template.translations.find((t) => t.language === lang) ||
        template.translations.find((t) => t.language === "English");

    if (!translation) return;

    const subject = translation.subject
        .replace("[[firstName]]", user.firstName || user.username || "User")
        .replace("[[appName]]", process.env.APP_NAME || "Our App");

    const resetLink = `${process.env.FRONTEND_URL || ""}/reset-password?token=${resetPasswordToken}`;

    const rawContent = translation.content
        .replace("[[firstName]]", user.firstName || user.username || "User")
        .replace("[[resetLink]]", resetLink)
        .replace("[[appName]]", process.env.APP_NAME || "Our App");

    const content = he.decode(rawContent);
       const existing = await prisma.emailSentCount.findFirst({
        where: { id: 1 },
    });
    if (existing) {
        await prisma.emailSentCount.update({
            where: { id: 1 },
            data: { passwordReset: { increment: 1 } },
        });
    } else {
        await prisma.emailSentCount.create({
            data: { id: 1, passwordReset: 1 },
        });
    }
    await sendEmail(user.email, subject, content);
};

module.exports = {
    sendForgotPasswordEmail,
    notifyAdminsNewTicket,
    sendWelcomeEmail,
    sendAccountDeletionEmail,
    sendProfileVisitEmail,
    sendLikeAcceptedEmail,
    sendPhotoRequestEmail,
    sendPackageExpiryWarningEmail,
    sendPackagePurchaseEmail,
    sendOtpEmail,
    sendAccountCreatedByAdminEmail
};
