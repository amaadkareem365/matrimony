const httpStatus = require("http-status");
const tokenService = require("./token.service");
const userService = require("./user.service");
const ApiError = require("../utils/ApiError");
const { tokenTypes } = require("../config/tokens");
const moment = require("moment");
const bcrypt = require("bcryptjs");

const { PrismaClient } = require("@prisma/client");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const prisma=require("../utils/db")
/**
 * Login with username and password
 * @param {string} email
 * @param {string} password
 * @returns {Promise<User>}
 */

const loginUserWithCredentials = async ({ email, password }) => {
  const user = await userService.getUserByEmail(email);

  if (!user || !(await bcrypt.compare(password, user.password))) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect credentials");
  }
   await prisma.user.update({
      where: { id: user.id },
      data: { lastLogin: new Date() },
    });
    
  return user;
};

const getUser = async (userId) => {
  const user = await prisma.user.findFirst({
    where: { id: +userId },
    include: {
      living:true,
      allow: {
        include: {
          permissions: true, // Includes all related permissions
        },
      },
    },
  });
  console.log(user)
  const { password: afterRequestPass, otp, otpExpiresAt, ...safeUser } = user;
  return safeUser;
};



const changeUserPassword = async (userId, currentPassword, newPassword) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new ApiError(httpStatus.NOT_FOUND, "User not found");
  }

  const isMatch = await bcrypt.compare(currentPassword, user.password);
  if (!isMatch) {
    throw new ApiError(httpStatus.UNAUTHORIZED, "Incorrect current password");
  }

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({
    where: { id: userId },
    data: { password: hashedPassword },
  });
};


// services/user.service.js

const updateAdmin = async (id, updateData) => {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    throw new ApiError(httpStatus.NOT_FOUND, "Admin not found");
  }

  if (updateData.password) {
    updateData.password = await bcrypt.hash(updateData.password, 8);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return updatedUser;
};
const generateAndStoreOTP = async (userId) => {
  const otp = crypto.randomInt(10000, 99999).toString(); // Generate 5-digit OTP
  const otpExpiresAt = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 mins

  // Store OTP and expiry in DB
  await prisma.user.update({
    where: { id: userId },
    data: { otp, otpExpiresAt },
  });

  // Send OTP via email
  return otp;
};

const verifyOTP = async (userId, otp) => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { otp: true, otpExpiresAt: true },
  });

  if (!user || user.otp !== otp || new Date() > user.otpExpiresAt) {
    return false;
  }

  // Clear OTP after verification
  await prisma.user.update({
    where: { id: userId },
    data: { otp: null, otpExpiresAt: null },
  });

  return true;
};
const resendOTP = async (userId) => {
  return generateAndStoreOTP(userId);
};



const seedProfileAttributes = async () => {
  const attributes = [
    { key: "origin", label: "Origin", order: 1 },
    { key: "religion", label: "Religion", order: 2 },
    { key: "relationStatus", label: "Relation Status", order: 3 },
    { key: "children", label: "Children", order: 4 },
    { key: "education", label: "Education", order: 5 },
    { key: "eyeColor", label: "Eye Color", order: 6 },
    { key: "hairColor", label: "Hair Color", order: 7 },
    { key: "bodyType", label: "Body Type", order: 8 },
    { key: "appearance", label: "Appearance", order: 9 },
    { key: "clothingStyles", label: "Clothing Styles", order: 10 },
    { key: "intelligence", label: "Intelligence", order: 11 },
    { key: "characterTraits", label: "Character Traits", order: 12 },
    { key: "sports", label: "Sports", order: 13 },
    { key: "hobbies", label: "Hobbies", order: 14 },
    { key: "music", label: "Music", order: 15 },
    { key: "kitchen", label: "Kitchen", order: 16 },
    { key: "amLookingFor", label: "Am Looking for", order: 17 },
    { key: "career", label: "Career", order: 18 },
    { key: "knownLanguages", label: "Known Languages", order: 19 },
    { key: "reading", label: "Reading", order: 20 },
    { key: "tvShows", label: "TV Shows", order: 21 },
    { key: "lengte", label: "Lengte", order: 22 },
    { key: "languages", label: "Languages", order: 23 },
    { key: "diploma", label: "Diploma", order: 24 },
    { key: "motherTongue", label: "Mother Tongue", order: 25 },
    { key: "personalAttitude", label: "Personal Attitude", order: 26 },
    { key: "cast", label: "Cast", order: 27 },
    { key: "subCast", label: "Sub-Cast", order: 28 },
    { key: "iAmA", label: "I am a", order: 29 },
    { key: "smoke", label: "Smoke", order: 30 },
    { key: "drinking", label: "Drinking", order: 31 },
    { key: "goingOut", label: "Going Out", order: 32 },
    { key: "primarySpecialization", label: "primarySpecialization", order: 33 },
    { key: "education", label: "education", order: 34 },
    { key: "department", label: "department", order: 35 },
  ];

  for (const attr of attributes) {
    try {
      await prisma.profileAttribute.upsert({
        where: { key: attr.key },
        update: {}, // leave empty to skip update if already exists
        create: {
          ...attr,
          type: "multiselect", // default or adjust if needed
          options: "", // empty string as requested
          isActive: true,
          isVisible: true,
          isRequired: false,
        },
      });
      console.log(`Inserted/Skipped: ${attr.key}`);
    } catch (error) {
      console.error(`Error inserting ${attr.key}:`, error.message);
    }
  }

  await prisma.$disconnect();
};
// seedProfileAttributes();



const emailTemplates = [
  {
    "key": "profile_view_notification",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Someone viewed your profile",
        "content": "<p>A member has visited your profile.</p>"
      }
    ]
  },
  {
    "key": "interest_accepted",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Your interest has been accepted",
        "content": "<p>Congratulations! Your interest request has been accepted.</p>"
      }
    ]
  },
  {
    "key": "new_chat_message",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "You have a new message",
        "content": "<p>You’ve received a new message. Check your inbox!</p>"
      }
    ]
  },
  {
    "key": "photo_request",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Photo request from a member",
        "content": "<p>A member has requested a photo from you.</p>"
      }
    ]
  },
  {
    "key": "package_purchase_confirmation",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Package purchase confirmation",
        "content": "<p>Thank you for purchasing a package!</p>"
      }
    ]
  },
  {
    "key": "vip_package_expiry_warning",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Your VIP package is ending soon",
        "content": "<p>Your VIP benefits will end soon. Renew now to continue enjoying premium features.</p>"
      }
    ]
  },
  {
    "key": "otp_activation",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Your OTP for account activation",
        "content": "<p>Use the OTP below to activate your account.</p>"
      }
    ]
  },
  {
    "key": "password_reset",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Password reset instructions",
        "content": "<p>Click the link below to reset your password.</p>"
      }
    ]
  },
  {
    "key": "account_deletion_confirmation",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Account deletion confirmation",
        "content": "<p>Your account has been successfully deleted.</p>"
      }
    ]
  },
  {
    "key": "welcome_after_activation",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Welcome to our platform",
        "content": "<p>Welcome! Your account is now active. Start exploring!</p>"
      }
    ]
  },
  {
    "key": "admin_register_member",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "New member registration",
        "content": "<p>A new member has been registered by admin.</p>"
      }
    ]
  },
  {
    "key": "admin_process_package",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Package purchase processed",
        "content": "<p>Your package was processed by the admin team.</p>"
      }
    ]
  },
  {
    "key": "admin_delete_account",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Account deletion notification",
        "content": "<p>A member account has been deleted by admin.</p>"
      }
    ]
  },
  {
    "key": "admin_verification_email",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Account verification required",
        "content": "<p>Please verify your account as requested by admin.</p>"
      }
    ]
  },
  {
    "key": "financial_report",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Your financial report is ready",
        "content": "<p>Your financial report has been generated.</p>"
      }
    ]
  },
  {
    "key": "income_report",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Monthly income statement",
        "content": "<p>Here is your income report for this month.</p>"
      }
    ]
  },
  {
    "key": "detailed_report",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Detailed activity report",
        "content": "<p>Here is a detailed report of your recent activities.</p>"
      }
    ]
  },
  {
    "key": "members_report",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Membership statistics report",
        "content": "<p>Overview of member statistics available in your dashboard.</p>"
      }
    ]
  },
  {
    "key": "report_profile",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Profile report notification",
        "content": "<p>A profile has been reported. Please review it.</p>"
      }
    ]
  },
  {
    "key": "user_inquiry",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "New user inquiry received",
        "content": "<p>You have received a new inquiry from a user.</p>"
      }
    ]
  },
  {
    "key": "user_registration",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Welcome to our community",
        "content": "<p>Thanks for registering! Let’s get started.</p>"
      }
    ]
  },
  {
    "key": "user_package_purchase",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Package purchase confirmation",
        "content": "<p>Thanks for purchasing a package!</p>"
      }
    ]
  },
  {
    "key": "new_matches",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "You have new matches",
        "content": "<p>We found new matches for you. Take a look!</p>"
      }
    ]
  },
  {
    "key": "admin_forgot_password",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Admin password reset",
        "content": "<p>Click below to reset your admin password.</p>"
      }
    ]
  },
  {
    "key": "user_forgot_password",
    "isActive": true,
    "status": "active",
    "translations": [
      {
        "language": "en",
        "subject": "Password reset instructions",
        "content": "<p>Click the link to reset your user password.</p>"
      }
    ]
  }
]



async function seedEmailTemplates() {
  for (const template of emailTemplates) {
    const existing = await prisma.emailTemplate.findUnique({
      where: { key: template.key },
    });

    if (!existing) {
      const created = await prisma.emailTemplate.create({
        data: {
          key: template.key,
          isActive: template.isActive,
          status: template.status,
          translations: {
            create: template.translations.map(t => ({
              language: t.language,
              subject: t.subject,
              content: t.content,
            })),
          },
        },
      });
      console.log(`✅ Created template: ${template.key}`);
    } else {
      console.log(`⚠️ Skipped (already exists): ${template.key}`);
    }
  }
}


const seedProfileAttributeOptions = async () => {
  const attributeOptions = {
    origin: "Asian,European,African,American,Other",
    religion: "Islam,Christianity,Hinduism,Buddhism,Atheism,Other",
    relationStatus: "Single,Married,Divorced,Widowed",
    children: "None,1,2,3+",
    education: "High School,Bachelor,Master,PhD,Other",
    eyeColor: "Brown,Blue,Green,Hazel,Grey,Other",
    hairColor: "Black,Brown,Blonde,Red,Grey,Other",
    bodyType: "Slim,Average,Fit,Muscular,Heavy",
    appearance: "Casual,Formal,Trendy,Traditional,Other",
    clothingStyles: "Casual,Formal,Traditional,Sporty,Trendy",
    intelligence: "Average,Above Average,High",
    characterTraits: "Kind,Funny,Adventurous,Honest,Loyal",
    sports: "Football,Basketball,Cricket,Swimming,Other",
    hobbies: "Reading,Traveling,Music,Gaming,Art,Other",
    music: "Pop,Rock,Jazz,Classical,Hip-Hop,Other",
    kitchen: "Italian,Chinese,Indian,Mexican,Other",
    amLookingFor: "Friendship,Relationship,Networking,Other",
    career: "Student,Engineer,Doctor,Artist,Entrepreneur,Other",
    knownLanguages: "English,Spanish,French,Urdu,Arabic,Other",
    reading: "Fiction,Non-fiction,Comics,Poetry,Other",
    tvShows: "Drama,Comedy,Action,Documentary,Reality,Other",
    lengte: "150-160 cm,161-170 cm,171-180 cm,181+ cm",
    languages: "English,Spanish,French,Urdu,Arabic,Other",
    diploma: "High School,Bachelor,Master,PhD,Other",
    motherTongue: "English,Spanish,French,Urdu,Arabic,Other",
    personalAttitude: "Optimistic,Pessimistic,Realistic,Other",
    cast: "Cast1,Cast2,Cast3,Other",
    subCast: "SubCast1,SubCast2,SubCast3,Other",
    iAmA: "Man,Woman,Non-binary,Other",
    smoke: "Yes,No,Occasionally",
    drinking: "Yes,No,Occasionally",
    goingOut: "Never,Sometimes,Often,Regularly",
    primarySpecialization:"test",
    education:"test",
    department:"test"
  };

  for (const [key, options] of Object.entries(attributeOptions)) {
    try {
      await prisma.profileAttribute.update({
        where: { key },
        data: { options },
      });
      console.log(`Updated options for: ${key}`);
    } catch (error) {
      console.error(`Error updating ${key}:`, error.message);
    }
  }

  await prisma.$disconnect();
};

// seedProfileAttributeOptions();
// seedEmailTemplates();

async function main() {
  // Make sure EN exists in Language table
  const en = await prisma.language.findUnique({
    where: { code: 'EN' },
  });

  if (!en) {
    throw new Error("Language EN not found. Please insert it first.");
  }

  // Example list with duplicates
  const rawTranslations = [
    "$50 for 6 months acc… access!",
    "1. Log in to Google Firebase and create a new app if you don’t have any.",
    "2. Go to Project Settings and select General tab.",
    "3. Select Config and you will find Firebase Config Credentials.",
    "4. Copy your App’s Credentials and paste the credentials into appropriate field.",
    "5. Now, select Cloud Messaging tab and enable Cloud Messaging API.",
    "6. After enabling Cloud Messaging API, you will find Server Key. Copy the key.",
    "7. Configure the “firebase-messaging-sw.js” file and keep the file in the root dir.",
    "About Me",
    "About Us",
    "Abuse Word Filtering",
    "Accept",
    "Accepted",
    "Account Opening Email To Admin",
    "Account Opening Email",
    "Action",
    "Activation",
    "Active",
    "Add a new photo",
    "Add Banner",
    "Add Blog",
    "Add Category",
    "Add Content",
    "Add Currency",
    "Add FAQ",
    "Add Field",
    "Add Member",
    "Add Member",   // duplicate
    "Add New",
    "Add New Blog Category",
    "Add New Package",
    "Add New Page",
    "Add New Staff",
    "Add New Staff Role",
    "Add Newsletter",
    "Add Order",
    "Add Package",
    "Add Page",
    "Add Translate",
    "Address Name",
    "Address Value",
    "Admin",
    "Admin Details",
    "Admin login page background",
    "Admin Name",
    "Admin Page Paragraph",
    "Admin Page Title",
    "Age",
    // ... continue all 1410
  ];

  // Deduplicate
  const translations = [...new Set(rawTranslations)].map((text) => ({
    key: text,
    text,
  }));

  for (const t of translations) {
    const result = await prisma.translation.upsert({
      where: {
        key_languageId: {
          key: t.key,
          languageId: en.id,
        },
      },
      update: { text: t.text },
      create: { ...t, languageId: en.id },
    });

    console.log(`✅ Added/Updated: "${result.key}"`);
  }

  console.log(`\n🎉 Done! Total unique EN translations seeded: ${translations.length}`);
}

// main()
//   .catch((e) => {
//     console.error(e);
//     process.exit(1);
//   })
//   .finally(async () => {
//     await prisma.$disconnect();
//   });

module.exports = {
  loginUserWithCredentials,
  getUser,
  changeUserPassword,
  updateAdmin,
  generateAndStoreOTP,
  verifyOTP,
  resendOTP
};