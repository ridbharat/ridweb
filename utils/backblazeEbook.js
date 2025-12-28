const B2 = require('backblaze-b2');

let b2Client = null;
let bucketIdCache = null;
let bucketNameCache = process.env.B2_EBOOK_BUCKET_NAME || 'ebookdata';

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

const getEbookUrl = async (fileName) => {
  const bucketId = await getBucketId();
  return `https://${bucketId}.backblazeb2.com/file/${bucketNameCache}/${encodeURIComponent(fileName)}`;
};

module.exports = { getEbookUrl };