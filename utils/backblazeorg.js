const B2 = require('backblaze-b2');

const uploadedToBackblaze = async (fileBuffer, folder) => {
  const b2 = new B2({
    applicationKeyId: process.env.B2_ACCOUNT_ID,
    applicationKey: process.env.B2_APPLICATION_KEY,
  });

  await b2.authorize();

  const bucketName = process.env.B2_BUCKET_NAME;

  // Get bucket
  const bucketsRes = await b2.listBuckets();
  const bucket = bucketsRes.data.buckets.find(b => b.bucketName === bucketName);
  if (!bucket) {
    throw new Error(`Bucket '${bucketName}' not found`);
  }
  const bucketId = bucket.bucketId;

  // Get upload URL
  const uploadUrlResponse = await b2.getUploadUrl({ bucketId });
  const { uploadUrl, authorizationToken } = uploadUrlResponse.data;

  // Generate unique fileName
  const fileName = `${folder}/${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

  // Upload the file
  const uploadResponse = await b2.uploadFile({
    uploadUrl,
    uploadAuthToken: authorizationToken,
    fileName,
    data: fileBuffer,
  });

  // Construct the public URL
  const secureUrl = `https://${bucketId}.backblazeb2.com/file/${bucketName}/${encodeURIComponent(fileName)}`;

  return {
    secure_url: secureUrl,
    public_id: fileName, // optional, to match cloudinary
  };
};

module.exports = { uploadedToBackblaze };