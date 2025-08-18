const { Token } = require("@prisma/client");
const allRoles = {
  CLIENT:[],
  ADMIN: [],
};

const roles = Object.keys(allRoles);
const roleRights = new Map(Object.entries(allRoles));

module.exports = {
  roles,
  roleRights,
};
