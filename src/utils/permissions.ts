import {Platform, Alert, Linking} from 'react-native';
import {
  check,
  request,
  PERMISSIONS,
  RESULTS,
  Permission,
} from 'react-native-permissions';

const getCameraPermission = (): Permission =>
  Platform.OS === 'ios'
    ? PERMISSIONS.IOS.CAMERA
    : PERMISSIONS.ANDROID.CAMERA;

const getPhotoLibraryPermission = (): Permission => {
  if (Platform.OS === 'ios') {
    return PERMISSIONS.IOS.PHOTO_LIBRARY;
  }
  if (Platform.OS === 'android' && Platform.Version >= 33) {
    return PERMISSIONS.ANDROID.READ_MEDIA_IMAGES;
  }
  return PERMISSIONS.ANDROID.READ_EXTERNAL_STORAGE;
};

function showBlockedAlert(permissionName: string): void {
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

export async function requestCameraPermission(): Promise<boolean> {
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

export async function requestPhotoLibraryPermission(): Promise<boolean> {
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
