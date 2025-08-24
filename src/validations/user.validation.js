const Joi = require('joi');

// Common validation for user ID parameter
const idField = Joi.number().integer().required();

const userIdParam = {
  params: Joi.object({
    userId: Joi.number().required()
  })
};
const permissionSchema = Joi.object({
  module: Joi.string().required(),
  canView: Joi.boolean().default(false),
  canCreate: Joi.boolean().default(false),
  canEdit: Joi.boolean().default(false),
  canDelete: Joi.boolean().default(false)
});
// User validations
const createUser = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().optional(),
    username: Joi.string().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    role: Joi.string(),
    dob: Joi.date().optional(),
    image: Joi.string().uri().optional(),
    phone: Joi.string().optional(),
    department: Joi.string().optional(),
    location: Joi.string().optional(),
    origin: Joi.string().optional(),
    gender: Joi.string().optional(),
    age: Joi.number().integer().optional(),
    relationshipStatus: Joi.string().optional(),
    children: Joi.string().optional(),
    religion: Joi.string().optional(),
    shortDescription: Joi.string().optional(),
    roleId: Joi.number().optional(),
    adminId: Joi.number().integer().optional()

  })
};

const createRole = {
  body: Joi.object({
    name: Joi.string().required(),
    description: Joi.string().optional(),
    catagory: Joi.string().optional(),
    isDefault: Joi.boolean().default(false),
    permissions: Joi.array().items(
      Joi.object({
        module: Joi.string().required(), // e.g., "Dashboard"
        canView: Joi.boolean().default(false),
        canCreate: Joi.boolean().default(false),
        canEdit: Joi.boolean().default(false),
        canDelete: Joi.boolean().default(false)
      })
    ).min(1)
  })
};
const updateUser = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    email: Joi.string().email().optional(),
    password: Joi.string().optional(),
    username: Joi.string().optional(),
    isActive: Joi.boolean().optional(),
    firstName: Joi.string().optional(),
    lastName: Joi.string().optional(),
    lookingFor: Joi.string().optional(),
    route: Joi.string().optional(),
    role: Joi.string().valid('CLIENT', 'ADMIN').optional(),
    dob: Joi.date().optional(),
    image: Joi.string().uri().optional(),
    phone: Joi.string().optional(),
    department: Joi.string().optional(),
    location: Joi.string().optional(),
    origin: Joi.string().optional(),
    gender: Joi.string().optional(),
    age: Joi.number().integer().optional(),
    relationshipStatus: Joi.string().optional(),
    children: Joi.string().optional(),
    religion: Joi.string().optional(),
    shortDescription: Joi.string().optional(),
    roleId: Joi.number().optional(),
    packageId: Joi.number().integer().optional(),
    activeLanguageId: Joi.number().integer().optional()
  }).min(1)
};

// EducationCareer validations
const educationCareer = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    primarySpecialization: Joi.string().required(),
    secondarySpecialization: Joi.string().optional(),
    qualifications: Joi.string().optional(),
    experience: Joi.string().optional(),
    education: Joi.string().optional(),
    certifications: Joi.string().optional(),
    department: Joi.string().optional(),
    position: Joi.string().optional()
  })
};

const educationCareerUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    primarySpecialization: Joi.string().optional(),
    secondarySpecialization: Joi.string().optional(),
    qualifications: Joi.string().optional(),
    experience: Joi.string().optional(),
    education: Joi.string().optional(),
    certifications: Joi.string().optional(),
    department: Joi.string().optional(),
    position: Joi.string().optional()
  }).min(1)
};

// PersonalityBehavior validations
const personalityBehavior = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    simple: Joi.boolean().optional(),
    musical: Joi.boolean().optional(),
    conservative: Joi.boolean().optional(),
    calm: Joi.boolean().optional(),
    pragmatic: Joi.boolean().optional(),
    streetSmart: Joi.boolean().optional(),
    subdued: Joi.boolean().optional(),
    demanding: Joi.boolean().optional(),
    narcissistic: Joi.boolean().optional(),
    eccentric: Joi.boolean().optional(),
    spiritual: Joi.boolean().optional(),
    talkative: Joi.boolean().optional(),
    prettySmart: Joi.boolean().optional(),
    undemanding: Joi.boolean().optional(),
    altruistic: Joi.boolean().optional(),
    stubborn: Joi.boolean().optional(),
    selfish: Joi.boolean().optional(),
    sporty: Joi.boolean().optional(),
    modest: Joi.boolean().optional(),
    humorous: Joi.boolean().optional(),
    romantic: Joi.boolean().optional(),
    serious: Joi.boolean().optional(),
    sharp: Joi.boolean().optional(),
    caring: Joi.boolean().optional(),
    spontaneously: Joi.boolean().optional(),
    freethinking: Joi.boolean().optional(),
    adventurous: Joi.boolean().optional(),
    sensual: Joi.boolean().optional(),
    straightForward: Joi.boolean().optional(),
    intellectual: Joi.boolean().optional(),
    embarrassed: Joi.boolean().optional(),
    exuberant: Joi.boolean().optional(),
    worldly: Joi.boolean().optional(),
    artistic: Joi.boolean().optional(),
    sluggish: Joi.boolean().optional(),
    compulsive: Joi.boolean().optional(),
    relaxed: Joi.boolean().optional()
  }).min(1)
};

// PartnerExpectation validations
const partnerExpectation = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    origin: Joi.string().optional(),
    lookingFor: Joi.string().optional(),
    length: Joi.string().optional(),
    religion: Joi.string().optional(),
    relationshipStatus: Joi.string().optional(),
    education: Joi.string().optional(),
    weight: Joi.string().optional(),
    smoke: Joi.string().optional(),
    drinking: Joi.string().optional(),
    goingOut: Joi.string().optional(),
    ageFrom: Joi.number().integer().optional(),
    ageTo: Joi.number().integer().optional(),
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional(),

  })
};

// Lifestyle validations
const lifestyle = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    smoke: Joi.string().optional(),
    drinking: Joi.string().optional(),
    goingOut: Joi.string().optional(),
    exercise: Joi.string().optional(),
    diet: Joi.string().optional(),
    pets: Joi.string().optional(),
    travel: Joi.string().optional(),
    socialMedia: Joi.string().optional(),
    workLifeBalance: Joi.string().optional(),
    nightLife: Joi.string().optional(),
    primaryHobby: Joi.string().optional()
  })
};

// HobbiesInterests validations
const hobbiesInterests = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    sports: Joi.string().optional(),
    music: Joi.string().optional(),
    kitchen: Joi.string().optional(),
    reading: Joi.string().optional(),
    tvShows: Joi.string().optional()
  })
};

// LanguageInfo validations
const languageInfo = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    motherTongue: Joi.string().required(),
    knownLanguages: Joi.string().optional()
  })
};

// Living validations
const living = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    country: Joi.string().required(),
    state: Joi.string().required(),
    city: Joi.string().required()
  })
};

// PhysicalAppearance validations
const physicalAppearance = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    height: Joi.string().optional(),
    eyeColor: Joi.string().optional(),
    hairColor: Joi.string().optional(),
    bodyType: Joi.string().optional(),
    weight: Joi.string().optional(),
    appearance: Joi.string().optional(),
    clothing: Joi.string().optional(),
    intelligence: Joi.string().optional(),
    language: Joi.string().optional()
  })
};


const personalityBehaviorUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    simple: Joi.boolean().optional(),
    musical: Joi.boolean().optional(),
    conservative: Joi.boolean().optional(),
    calm: Joi.boolean().optional(),
    pragmatic: Joi.boolean().optional(),
    streetSmart: Joi.boolean().optional(),
    subdued: Joi.boolean().optional(),
    demanding: Joi.boolean().optional(),
    narcissistic: Joi.boolean().optional(),
    eccentric: Joi.boolean().optional(),
    spiritual: Joi.boolean().optional(),
    talkative: Joi.boolean().optional(),
    prettySmart: Joi.boolean().optional(),
    undemanding: Joi.boolean().optional(),
    altruistic: Joi.boolean().optional(),
    stubborn: Joi.boolean().optional(),
    selfish: Joi.boolean().optional(),
    sporty: Joi.boolean().optional(),
    modest: Joi.boolean().optional(),
    humorous: Joi.boolean().optional(),
    romantic: Joi.boolean().optional(),
    serious: Joi.boolean().optional(),
    sharp: Joi.boolean().optional(),
    caring: Joi.boolean().optional(),
    spontaneously: Joi.boolean().optional(),
    freethinking: Joi.boolean().optional(),
    adventurous: Joi.boolean().optional(),
    sensual: Joi.boolean().optional(),
    straightForward: Joi.boolean().optional(),
    intellectual: Joi.boolean().optional(),
    embarrassed: Joi.boolean().optional(),
    exuberant: Joi.boolean().optional(),
    worldly: Joi.boolean().optional(),
    artistic: Joi.boolean().optional(),
    sluggish: Joi.boolean().optional(),
    compulsive: Joi.boolean().optional(),
    relaxed: Joi.boolean().optional()
  }).min(1)
};

const partnerExpectationUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    origin: Joi.string().optional(),
    lookingFor: Joi.string().optional(),
    length: Joi.string().optional(),
    religion: Joi.string().optional(),
    relationshipStatus: Joi.string().optional(),
    education: Joi.string().optional(),
    weight: Joi.string().optional(),
    smoke: Joi.string().optional(),
    drinking: Joi.string().optional(),
    goingOut: Joi.string().optional(),
    ageFrom: Joi.number().integer().optional(),
    ageTo: Joi.number().integer().optional(),
    country: Joi.string().optional(),
    city: Joi.string().optional(),
    state: Joi.string().optional()
  }).min(1)
};

const lifestyleUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    smoke: Joi.string().optional(),
    drinking: Joi.string().optional(),
    goingOut: Joi.string().optional(),
    exercise: Joi.string().optional(),
    diet: Joi.string().optional(),
    pets: Joi.string().optional(),
    travel: Joi.string().optional(),
    socialMedia: Joi.string().optional(),
    workLifeBalance: Joi.string().optional(),
    nightLife: Joi.string().optional(),
    primaryHobby: Joi.string().optional()
  }).min(1)
};

const hobbiesInterestsUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    sports: Joi.string().optional(),
    music: Joi.string().optional(),
    kitchen: Joi.string().optional(),
    reading: Joi.string().optional(),
    tvShows: Joi.string().optional()
  }).min(1)
};

const languageInfoUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    motherTongue: Joi.string().optional(),
    knownLanguages: Joi.string().optional()
  }).min(1)
};

const livingUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    country: Joi.string().optional(),
    state: Joi.string().optional(),
    city: Joi.string().optional()
  }).min(1)
};

const physicalAppearanceUpdate = {
  params: Joi.object({
    userId: Joi.number().required()
  }),
  body: Joi.object({
    height: Joi.string().optional(),
    eyeColor: Joi.string().optional(),
    hairColor: Joi.string().optional(),
    bodyType: Joi.string().optional(),
    weight: Joi.string().optional(),
    appearance: Joi.string().optional(),
    clothing: Joi.string().optional(),
    intelligence: Joi.string().optional(),
    language: Joi.string().optional()
  }).min(1)
};


const photoSettingSchema = Joi.object({
  onlyMembersWithPhotoCanSee: Joi.boolean().required(),
  onlyVipCanSee: Joi.boolean().required(),
  blurForFreeMembers: Joi.boolean().required(),
  onRequestOnly: Joi.boolean().required(),
});

const updatePhotoSettingSchema = photoSettingSchema.keys({
  id: idField,
});



const supportTicketSchema = Joi.object({
  subject: Joi.string().required(),
  category: Joi.string().required(),  // You can later use enum
  priority: Joi.string().valid('low', 'medium', 'high').required(),
  description: Joi.string().required(),
});

const updateTicketStatusSchema = Joi.object({
  id: idField,
  status: Joi.string().valid('open', 'in_progress', 'closed').required(),
});


const supportReplySchema = Joi.object({
  ticketId: Joi.number().required(),
  message: Joi.string().required(),
});

const getAllUsers = Joi.object({
  page: Joi.number().min(1).optional(),
  limit: Joi.number().min(1).max(100).optional(),
  search: Joi.string().optional(),
  status: Joi.string().valid("active", "inactive", "blocked").optional(),
  gender: Joi.string().valid("man", "woman").optional(),
  isPremium: Joi.string().valid("true", "false").optional()
});


const updateRole = {
  body: Joi.object({
    name: Joi.string().optional(),
    catagory: Joi.string().optional(),
    description: Joi.string().optional(),
    isDefault: Joi.boolean().optional(),
    isActive: Joi.boolean().optional(),
    permissions: Joi.array().items(permissionSchema)
  })
};

module.exports = {
  updateRole,
  getAllUsers,
  userIdParam,
  createUser,
  updateUser,
  educationCareer,
  educationCareerUpdate,
  personalityBehavior,
  partnerExpectation,
  lifestyle,
  hobbiesInterests,
  languageInfo,
  living,
  physicalAppearance,
  educationCareerUpdate,
  personalityBehavior,
  personalityBehaviorUpdate,
  partnerExpectation,
  partnerExpectationUpdate,
  lifestyle,
  lifestyleUpdate,
  hobbiesInterests,
  hobbiesInterestsUpdate,
  languageInfo,
  languageInfoUpdate,
  living,
  livingUpdate,
  physicalAppearance,
  physicalAppearanceUpdate,
  photoSettingSchema,
  updatePhotoSettingSchema,
  supportTicketSchema,
  updateTicketStatusSchema,
  supportReplySchema,
  createRole
};