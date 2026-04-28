import RNFS from 'react-native-fs';

const IMAGE_DIR = `${RNFS.DocumentDirectoryPath}/images`;
const MOTORCYCLE_DIR = `${IMAGE_DIR}/motorcycles`;
const RECEIPT_DIR = `${IMAGE_DIR}/receipts`;

async function ensureDirs(): Promise<void> {
  const dirs = [IMAGE_DIR, MOTORCYCLE_DIR, RECEIPT_DIR];
  for (const dir of dirs) {
    const exists = await RNFS.exists(dir);
    if (!exists) {
      await RNFS.mkdir(dir);
    }
  }
}

function generateFilename(originalName: string = 'image.jpg'): string {
  const timestamp = Date.now();
  const random = Math.floor(Math.random() * 10000);
  const ext = originalName.split('.').pop() || 'jpg';
  return `${timestamp}_${random}.${ext}`;
}

export async function saveImage(sourceUri: string, type: 'motorcycle' | 'receipt' = 'receipt'): Promise<string> {
  await ensureDirs();

  const targetDir = type === 'motorcycle' ? MOTORCYCLE_DIR : RECEIPT_DIR;
  const filename = generateFilename(sourceUri.split('/').pop());
  const destPath = `${targetDir}/${filename}`;

  const sourcePath = sourceUri.startsWith('file://')
    ? sourceUri.replace('file://', '')
    : sourceUri;

  await RNFS.copyFile(sourcePath, destPath);

  return destPath;
}

export async function saveImages(assets: Array<{ uri?: string }> = [], type: 'motorcycle' | 'receipt' = 'receipt'): Promise<string[]> {
  const paths: string[] = [];
  for (const asset of assets) {
    if (asset?.uri) {
      const path = await saveImage(asset.uri, type);
      paths.push(path);
    }
  }
  return paths;
}

export async function deleteImage(filePath: string): Promise<boolean> {
  try {
    const exists = await RNFS.exists(filePath);
    if (exists) {
      await RNFS.unlink(filePath);
    }
    return true;
  } catch (error) {
    if (__DEV__) {
      console.error('[imageStorage] deleteImage failed:', error);
    }
    return false;
  }
}
