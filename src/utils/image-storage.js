// src/utils/image-storage.js
import RNFS from 'react-native-fs';

// Persistent directory for app images (survives cache clears)
const IMAGE_DIR = `${RNFS.DocumentDirectoryPath}/images`;
const MOTORCYCLE_DIR = `${IMAGE_DIR}/motorcycles`;
const RECEIPT_DIR = `${IMAGE_DIR}/receipts`;

/**
 * Ensure the image directories exist.
 */
async function ensureDirs() {
  const dirs = [IMAGE_DIR, MOTORCYCLE_DIR, RECEIPT_DIR];
  for (const dir of dirs) {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
    }
  }
}

/**
 * Generate a unique filename with timestamp.
 * @param {string} originalName - Original file name or fallback
 * @returns {string}
 */
function generateFilename(originalName = 'image.jpg') {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = originalName.split('.').pop() || 'jpg';
  return `${timestamp}_${random}.${ext}`;
}

/**
 * Copy an image from picker URI to the app's document directory.
 *
 * @param {string} sourceUri - URI from image picker (e.g., file:///tmp/...)
 * @param {'motorcycle'|'receipt'} type - Where to store the image
 * @returns {Promise<string>} Saved file path (persistent)
 */
export async function saveImage(sourceUri, type = 'receipt') {
  await ensureDirs();

  const targetDir = type === 'motorcycle' ? MOTORCYCLE_DIR : RECEIPT_DIR;
  const filename = generateFilename(sourceUri.split('/').pop());
  const destPath = `${targetDir}/${filename}`;

  // Handle both file:// URIs and plain paths
  const sourcePath = sourceUri.startsWith('file://')
    ? sourceUri.replace('file://', '')
    : sourceUri;

  await RNFS.copyFile(sourcePath, destPath);

  return destPath;
}

/**
 * Save multiple images at once.
 *
 * @param {Array<{uri: string}>} assets - Array of picker assets
 * @param {'motorcycle'|'receipt'} type - Where to store
 * @returns {Promise<string[]>} Array of saved file paths
 */
export async function saveImages(assets = [], type = 'receipt') {
  const paths = [];
  for (const asset of assets) {
    if (asset?.uri) {
      const path = await saveImage(asset.uri, type);
      paths.push(path);
    }
  }
  return paths;
}

/**
 * Delete an image from local storage.
 *
 * @param {string} filePath - Absolute path to the image
 * @returns {Promise<boolean>}
 */
export async function deleteImage(filePath) {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
    return true;
  } catch (error) {
    console.error('[imageStorage] deleteImage failed:', error);
    return false;
  }
}
