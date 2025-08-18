const sanitizeFilename = (filename) => {
    const illegalRe = /[\/\?<>\\:\*\|"]/g;
    const controlRe = /[\x00-\x1f\x80-\x9f]/g;
    const reservedRe = /^\.+/;
    const windowsReservedRe = /^(con|prn|aux|nul|com[0-9]|lpt[0-9])(\..*)?$/i;
    const windowsTrailingRe = /[\. ]+$/;
  
    const sanitized = filename
      .replace(illegalRe, "")
      .replace(controlRe, "")
      .replace(reservedRe, "")
      .replace(windowsReservedRe, "")
      .replace(windowsTrailingRe, "")
      .trim();
  
    // Optionally, truncate the filename to prevent issues with max filename lengths
    const maxLength = 255; // Adjust according to your environment's limits
    return sanitized.length > maxLength
      ? sanitized.substring(0, maxLength)
      : sanitized;
  };
  
  module.exports = sanitizeFilename;
  