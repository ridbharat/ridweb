const B2 = require('backblaze-b2');
const fs = require('fs').promises;
const path = require('path');
const axios = require('axios');

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

// Get download URL using Backblaze API
const getAuthenticatedDownloadUrl = async (fileName) => {
  try {
    const b2 = await initB2();
    const bucketId = await getBucketId();

    // First, get the file info to check if it exists
    const fileInfoResponse = await b2.listFileNames({
      bucketId: bucketId,
      startFileName: fileName,
      maxFileCount: 1,
      prefix: fileName
    });

    if (!fileInfoResponse.data.files || fileInfoResponse.data.files.length === 0) {
      throw new Error(`File ${fileName} not found in Backblaze bucket`);
    }

    // Use the proper download URL construction
    const downloadUrl = `https://f002.backblazeb2.com/file/${bucketNameCache}/${encodeURIComponent(fileName)}`;

    return downloadUrl;
  } catch (error) {
    console.warn(`Backblaze file access error for ${fileName}:`, error.message);
    throw error;
  }
};

// Keep the old function for backward compatibility but mark as deprecated
const getEbookUrl = async (fileName) => {
  console.warn('getEbookUrl is deprecated for private Backblaze buckets. Use downloadEbookToTemp instead.');
  throw new Error('Backblaze URLs are not public. Use authenticated download instead.');
};

// Download file from Backblaze to temp folder using proper API
const downloadEbookToTemp = async (fileName) => {
  const tempDir = path.join(__dirname, '..', 'temp');
  const tempFilePath = path.join(tempDir, fileName);

  try {
    // Check if file already exists in temp (cache)
    try {
      await fs.access(tempFilePath);
      console.log(`📁 File ${fileName} already exists in temp folder (cached)`);
      return tempFilePath;
    } catch {
      // File doesn't exist, need to download
    }

    // For demo purposes, prioritize local files (faster)
    const localPath = path.join(__dirname, '..', 'public', 'uploads', 'pdfs', fileName);
    try {
      await fs.access(localPath);
      console.log(`🏠 Using local file for ${fileName} (fast path)`);
      return localPath;
    } catch {
      // Local file doesn't exist, try Backblaze
      console.log(`☁️ Local file not found, downloading from Backblaze: ${fileName}...`);
    }

    const b2 = await initB2();
    const bucketId = await getBucketId();

    // Check if file exists in Backblaze first
    console.log(`🔍 Checking if ${fileName} exists in Backblaze...`);
    const fileListResponse = await b2.listFileNames({
      bucketId: bucketId,
      startFileName: fileName,
      maxFileCount: 1,
      prefix: fileName
    });

    if (!fileListResponse.data.files || fileListResponse.data.files.length === 0) {
      throw new Error(`File ${fileName} not found in Backblaze bucket '${bucketNameCache}'`);
    }

    console.log(`📥 Downloading ${fileName} from Backblaze...`);

    // Download the file using Backblaze API
    const downloadResponse = await b2.downloadFileByName({
      bucketName: bucketNameCache,
      fileName: fileName,
      responseType: 'stream'
    });

    // Ensure temp directory exists
    await fs.mkdir(tempDir, { recursive: true });

    // Save file to temp directory
    const writer = require('fs').createWriteStream(tempFilePath);
    downloadResponse.data.pipe(writer);

    return new Promise((resolve, reject) => {
      writer.on('finish', () => {
        console.log(`✅ Successfully downloaded ${fileName} to temp folder (${tempFilePath})`);
        resolve(tempFilePath);
      });
      writer.on('error', (error) => {
        console.error(`❌ Error saving ${fileName} to temp:`, error);
        reject(error);
      });
    });

  } catch (error) {
    console.error(`❌ Failed to download ${fileName} from Backblaze:`, error.message);

    // Try fallback to local file if Backblaze fails
    const localPath = path.join(__dirname, '..', 'public', 'uploads', 'pdfs', fileName);
    try {
      await fs.access(localPath);
      console.log(`⚠️ Using local fallback for ${fileName}`);
      return localPath;
    } catch (localError) {
      console.error(`❌ Local fallback also failed for ${fileName}:`, localError.message);
      throw new Error(`File ${fileName} not available in Backblaze or local storage`);
    }
  }
};

// Clean up old temp files (older than 1 hour)
const cleanupTempFiles = async () => {
  const tempDir = path.join(__dirname, '..', 'temp');

  try {
    const files = await fs.readdir(tempDir);
    const now = Date.now();
    const oneHour = 60 * 60 * 1000; // 1 hour in milliseconds

    for (const file of files) {
      const filePath = path.join(tempDir, file);
      const stats = await fs.stat(filePath);

      if (now - stats.mtime.getTime() > oneHour) {
        await fs.unlink(filePath);
        console.log(`Cleaned up old temp file: ${file}`);
      }
    }
  } catch (error) {
    console.warn('Error during temp file cleanup:', error.message);
  }
};

// Clean up specific file
const cleanupTempFile = async (fileName) => {
  const tempFilePath = path.join(__dirname, '..', 'temp', fileName);

  try {
    await fs.unlink(tempFilePath);
    console.log(`Cleaned up temp file: ${fileName}`);
  } catch (error) {
    // File might not exist, ignore
  }
};

module.exports = {
  getEbookUrl, // Deprecated - don't use for private buckets
  getAuthenticatedDownloadUrl,
  downloadEbookToTemp,
  cleanupTempFiles,
  cleanupTempFile
};