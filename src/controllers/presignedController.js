const AWS = require("aws-sdk");
const dotenv = require("dotenv");
dotenv.config();

const s3 = new AWS.S3({
  endpoint: process.env.DO_SPACE_END_POINT, // Use your DigitalOcean Spaces endpoint from config
  forcePathStyle: false,
  region: process.env.DO_SPACE_REGION,
  credentials: {
    accessKeyId: process.env.DO_SPACE_ACCESS_KEY, // Your Spaces access key from config
    secretAccessKey: process.env.DO_SPACE_SECRET_KEY, // Your Spaces secret key from config
  },
  signatureVersion: "v4",
});

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

const generatePresignedUrl = async (mediaType, originalFilename, fileType) => {
  const timestamp = Date.now();
  const sanitizedFilename = sanitizeFilename(originalFilename);
  const filenameWithoutSpaces = sanitizedFilename.replace(/\s+/g, "_");

  let customFilename = `$resource_${timestamp}_${filenameWithoutSpaces}`;
  let key = `${mediaType}/${customFilename}`; // Upload to the 'feedback' folder

  // Define the S3 parameters
  const params = {
    Bucket: process.env.DO_SPACE_BUCKET_NAME,
    ContentType: fileType,
    Key: key,
    Expires: 60 * 10, // 10 minutes expiry time for the pre-signed URL
    ACL: "public-read",
  };

  const absolutePath = `${process.env.DO_SPACE_CDN_URL}/${key}`;

  return new Promise((resolve, reject) => {
    s3.getSignedUrl("putObject", params, (error, url) => {
      if (error) {
        reject(new Error("Error generating pre-signed URL"));
      } else {
        resolve({ url, path: absolutePath });
      }
    });
  });
};

const presignedUploadUrl = async (req, res) => {
  try {
    const { type: fileType, mediaType } = req.query;
    const originalFilename = req.params.filename;

    if (!mediaType || !fileType || !originalFilename) {
      return res.status(400).json({ error: "Missing required parameters" });
    }

    const { url, path } = await generatePresignedUrl(
      mediaType,
      originalFilename,
      fileType
    );
    res.json({ url, path });
  } catch (error) {
    res.status(500).json({ error: error.message || "Internal server error" });
  }
};

module.exports = {
  presignedUploadUrl,
};
