import { Platform, PermissionsAndroid, Linking, NativeModules } from 'react-native';
const AllFilesNative = NativeModules?.AllFilesPermissionModule;

// Check if running on Android 13+ (API level 33+)
const isAndroid13Plus = (): boolean => {
  try {
    return (Platform.OS === 'android' && Platform.Version >= 33);
  } catch {
    return false;
  }
};

// Check if running on Android 16+ (API level 35+)
const isAndroid16Plus = (): boolean => {
  try {
    return (Platform.OS === 'android' && Platform.Version >= 35);
  } catch {
    return false;
  }
};

export const isExternalStorageManager = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !AllFilesNative || typeof AllFilesNative.isExternalStorageManager !== 'function') {
    return true;
  }
  try {
    return await AllFilesNative.isExternalStorageManager();
  } catch {
    return false;
  }
};

export const openManageAllFilesSettings = async (): Promise<boolean> => {
  if (Platform.OS !== 'android' || !AllFilesNative || typeof AllFilesNative.openManageAllFilesSettings !== 'function') {
    return false;
  }
  try {
    return await AllFilesNative.openManageAllFilesSettings();
  } catch {
    return false;
  }
};

export const requestStoragePermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true; // On iOS, permissions are handled differently (via Info.plist)
  }

  try {
    // For Android 16+ (API 35+), request the new granular media permissions
    if (isAndroid16Plus()) {
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      ];

      // Try to add the user-selected permissions if available
      try {
        if ((PermissionsAndroid.PERMISSIONS as any).READ_MEDIA_VISUAL_USER_SELECTED) {
          permissions.push((PermissionsAndroid.PERMISSIONS as any).READ_MEDIA_VISUAL_USER_SELECTED);
        }
        if ((PermissionsAndroid.PERMISSIONS as any).READ_MEDIA_AUDIO_USER_SELECTED) {
          permissions.push((PermissionsAndroid.PERMISSIONS as any).READ_MEDIA_AUDIO_USER_SELECTED);
        }
      } catch (e) {
        // User-selected permissions not available on this Android version
      }

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      // Check if all critical permissions are granted
      const allGranted = permissions.every(
        perm => results[perm] === PermissionsAndroid.RESULTS.GRANTED
      );

      if (allGranted) {
        return true;
      }
    } else if (isAndroid13Plus()) {
      // For Android 13-15 (API 33-34), request the media-specific permissions
      const permissions = [
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_IMAGES,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_VIDEO,
        PermissionsAndroid.PERMISSIONS.READ_MEDIA_AUDIO,
      ];

      const results = await PermissionsAndroid.requestMultiple(permissions);
      
      const allGranted = permissions.every(
        perm => results[perm] === PermissionsAndroid.RESULTS.GRANTED
      );

      if (allGranted) {
        return true;
      }
    } else {
      // For Android 12 and below, use the legacy READ_EXTERNAL_STORAGE permission
      const hasPermission = await PermissionsAndroid.check(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE
      );

      if (hasPermission) {
        return true;
      }

      const status = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE,
        {
          title: 'Storage Permission',
          message: 'App needs access to your storage to read files.',
          buttonNeutral: 'Ask Me Later',
          buttonNegative: 'Cancel',
          buttonPositive: 'OK',
        },
      );

      return status === PermissionsAndroid.RESULTS.GRANTED;
    }

    return false;
  } catch (err) {
    console.warn('Error requesting storage permission:', err);
    const error = new Error('Storage permission request failed');
    error.name = 'PermissionError';
    (error as any).cause = err;
    throw error;
  }
};

// ✅ Added Wi-Fi / Location Permission (for Wi-Fi scanning & direct transfer)
export const requestWifiPermissions = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    return true;
  }

  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      {
        title: 'Location Permission',
        message: 'App needs location access to scan nearby Wi-Fi networks.',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      }
    );

    return granted === PermissionsAndroid.RESULTS.GRANTED;
  } catch (err) {
    console.warn('Error requesting Wi-Fi (location) permission:', err);
    return false;
  }
};

export const openDeviceSettings = async (): Promise<void> => {
  if (Platform.OS === 'android') {
    try {
      // Try to open the exact All-files page via native module first
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const NativeModule = require('react-native').NativeModules?.AllFilesPermissionModule;
      if (NativeModule && typeof NativeModule.openManageAllFiles === 'function') {
        try { NativeModule.openManageAllFiles(); return; } catch (e) { /* fallthrough */ }
      }
      // If native module missing, silently return per user's instruction
    } catch (error) {
      // silent fail
    }
  } else {
    // For iOS, open app settings
    await Linking.openURL('app-settings:');
  }
};

export const hasManageAllFilesPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') {
    // On iOS, use the standard storage permission check
    return requestStoragePermissions();
  }

  // For Android, we'll use the standard storage permission check
  // as MANAGE_EXTERNAL_STORAGE is not recommended for most apps
  // and requires special approval on the Play Store
  return requestStoragePermissions();
};

// No-op: user requested alerts be removed completely
export const showPermissionDeniedAlert = (_onOpenSettings: () => void) => {
  // Intentionally empty
};
