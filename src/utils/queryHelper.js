// utils/queryHelper.js

const buildQueryParams = (params) => {
    return new URLSearchParams(params).toString();
  };
  
  module.exports = { buildQueryParams };
  