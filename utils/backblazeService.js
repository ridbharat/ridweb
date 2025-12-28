const B2 = require('backblaze-b2');
const fs = require('fs').promises;

let b2Client = null;
let bucketIdCache = null;
let bucketNameCache = process.env.B2_BUCKET_NAME;

const initB2 = async () => {
  if (!b2Client) {
    b2Client = new B2({
      applicationKeyId: process.env.B2_ACCOUNT_ID,
      applicationKey: process.env.B2_APPLICATION_KEY,
    });
    await b2Client.authorize();
  }
  return b2Client;
};

const getBucketId = async () => {
  if (!bucketIdCache) {
    const b2 = await initB2();
    const bucketsRes = await b2.listBuckets();
    const bucket = bucketsRes.data.buckets.find(b => b.bucketName === bucketNameCache);
    if (!bucket) {
      throw new Error(`Bucket '${bucketNameCache}' not found`);
    }
    bucketIdCache = bucket.bucketId;
  }
  return bucketIdCache;
};

const uploadToBackblaze = async (file, folder) => {
  try {
    const b2 = await initB2();
    const bucketId = await getBucketId();

    // Read file as buffer
    const fileBuffer = await fs.readFile(file.tempFilePath);

    // Get upload URL
    const uploadUrlResponse = await b2.getUploadUrl({ bucketId });
    const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

    // Generate unique fileName
    const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}-${file.name}`;

    // Upload the file
    const uploadResponse = await b2.uploadFile({
      uploadUrl,
      uploadAuthToken: authorizationToken,
      fileName,
      data: fileBuffer,
    });

    // Delete temp file
    await fs.unlink(file.tempFilePath);

    // Construct the public URL
    const secureUrl = `https://${bucketId}.backblazeb2.com/file/${bucketNameCache}/${encodeURIComponent(fileName)}`;

    return secureUrl;
  } catch (error) {
    console.error("Backblaze upload error:", error);
    // Try to delete temp file even on error
    try {
      await fs.unlink(file.tempFilePath);
    } catch (unlinkError) {
      console.error("Error deleting temp file:", unlinkError);
    }
    throw error;
  }
};

module.exports = { uploadToBackblaze };