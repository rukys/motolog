// src/utils/permissions.js
import {Platform, Alert, Linking} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
} from 'react-native-permissions';

/**
 * Get the correct camera permission for the current platform.
 */
const getCameraPermission = () =>
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

/**
 * Get the correct photo library permission for the current platform.
 */
const getPhotoLibraryPermission = () => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.PHOTO_LIBRARY;
  }
  // Android 13+ uses READ_MEDIA_IMAGES, older uses READ_EXTERNAL_STORAGE
  if (Platform.Version >= 33) {
    return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
  }
  return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
};

/**
 * Show an alert that directs the user to app settings when permission is blocked.
 * @param {string} permissionName - Human-readable permission name
 */
function showBlockedAlert(permissionName) {
  Alert.alert(
    'Permission Required',
    `${permissionName} permission is blocked. Please enable it in your device settings to continue.`,
    [
      {text: 'Cancel', style: 'cancel'},
      {
        text: 'Open Settings',
        onPress: () => Linking.openSettings(),
      },
    ],
  );
}

/**
 * Request camera permission.
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestCameraPermission() {
  try {
    const permission = getCameraPermission();
    const status = await check(permission);

    switch (status) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        return true;

      case RESULTS.DENIED: {
        const result = await request(permission);
        return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
      }

      case RESULTS.BLOCKED:
        showBlockedAlert('Camera');
        return false;

      case RESULTS.UNAVAILABLE:
        Alert.alert('Unavailable', 'Camera is not available on this device.');
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error('[permissions] requestCameraPermission failed:', error);
    return false;
  }
}

/**
 * Request photo library permission.
 * @returns {Promise<boolean>} Whether permission was granted
 */
export async function requestPhotoLibraryPermission() {
  try {
    const permission = getPhotoLibraryPermission();
    const status = await check(permission);

    switch (status) {
      case RESULTS.GRANTED:
      case RESULTS.LIMITED:
        return true;

      case RESULTS.DENIED: {
        const result = await request(permission);
        return result === RESULTS.GRANTED || result === RESULTS.LIMITED;
      }

      case RESULTS.BLOCKED:
        showBlockedAlert('Photo Library');
        return false;

      case RESULTS.UNAVAILABLE:
        Alert.alert(
          'Unavailable',
          'Photo Library is not available on this device.',
        );
        return false;

      default:
        return false;
    }
  } catch (error) {
    console.error(
      '[permissions] requestPhotoLibraryPermission failed:',
      error,
    );
    return false;
  }
}
