/**
 * Android Studio & Mobile Device Integration Bridge
 * Provides robust native device permission handling, storage persistence,
 * and reliable file saving (PDF & ICS) for Android APK (WebView, TWA, Capacitor, Cordova).
 */

declare global {
  interface Window {
    Android?: {
      requestStoragePermission?: () => boolean | string;
      requestNotificationPermission?: () => boolean | string;
      saveFile?: (filename: string, base64Data: string, mimeType: string) => boolean;
      downloadFile?: (filename: string, urlOrBase64: string) => boolean;
      downloadBase64File?: (filename: string, base64: string, mimeType: string) => boolean;
      vibrate?: (ms: number) => void;
      showToast?: (msg: string) => void;
      openUrl?: (url: string) => void;
      exitApp?: () => void;
    };
    AndroidBridge?: {
      requestStoragePermission?: () => boolean | string;
      requestNotificationPermission?: () => boolean | string;
      saveBase64File?: (filename: string, base64Data: string, mimeType: string) => boolean;
      downloadFile?: (filename: string, url: string) => boolean;
      vibrate?: (ms: number) => void;
      showToast?: (msg: string) => void;
    };
    JSInterface?: {
      saveFile?: (filename: string, base64Data: string) => boolean;
      download?: (filename: string, base64Data: string) => boolean;
      vibrate?: (ms: number) => void;
    };
  }
}

export interface StoragePermissionResult {
  granted: boolean;
  persisted: boolean;
  message: string;
}

/**
 * Detects if the current client is running on an Android device or Android WebView / APK
 */
export function isAndroidDevice(): boolean {
  if (typeof navigator === 'undefined') return false;
  const ua = navigator.userAgent.toLowerCase();
  return ua.includes('android');
}

/**
 * Detects if running inside an Android WebView or standalone APK container
 */
export function isAndroidWebView(): boolean {
  if (typeof window === 'undefined') return false;
  if (window.Android || window.AndroidBridge) return true;
  const ua = (navigator.userAgent || '').toLowerCase();
  return isAndroidDevice() && (ua.includes('; wv') || ua.includes('version/4.0'));
}

/**
 * Requests device storage persistence and checks storage permissions.
 * In Android Studio WebView and mobile Chrome, this prompts the OS / browser to
 * preserve the application's offline data (tasks, notes, settings) permanently.
 */
export async function requestDeviceStoragePermission(): Promise<StoragePermissionResult> {
  let isGranted = true;
  let isPersisted = false;

  // 1. If running with custom Android Studio JavaScriptInterface
  try {
    if (window.Android?.requestStoragePermission) {
      window.Android.requestStoragePermission();
      isGranted = true;
    } else if (window.AndroidBridge?.requestStoragePermission) {
      window.AndroidBridge.requestStoragePermission();
      isGranted = true;
    }
  } catch (err) {
    console.warn('Error invoking Android Native Storage Permission bridge:', err);
  }

  // 2. Mobile StorageManager Persistence API (Standard Web / WebView on Android)
  if (typeof navigator !== 'undefined' && navigator.storage) {
    try {
      if (navigator.storage.persist) {
        isPersisted = await navigator.storage.persist();
      } else if (navigator.storage.persisted) {
        isPersisted = await navigator.storage.persisted();
      }
    } catch (e) {
      console.warn('Error requesting storage persistence:', e);
    }
  }

  return {
    granted: isGranted,
    persisted: isPersisted,
    message: isPersisted
      ? 'Almacenamiento persistente autorizado en el dispositivo Android.'
      : 'Almacenamiento del dispositivo listo para guardar archivos.'
  };
}

/**
 * Requests notification permission from Android OS / Mobile browser.
 * On Android 13+ (API 33+), this triggers the native POST_NOTIFICATIONS permission prompt.
 */
export async function requestDeviceNotificationPermission(): Promise<NotificationPermission> {
  // 1. Android Native Bridge
  try {
    if (window.Android?.requestNotificationPermission) {
      window.Android.requestNotificationPermission();
    } else if (window.AndroidBridge?.requestNotificationPermission) {
      window.AndroidBridge.requestNotificationPermission();
    }
  } catch (err) {
    console.warn('Error calling Android Notification bridge:', err);
  }

  // 2. Web Notification API
  if (typeof window !== 'undefined' && 'Notification' in window) {
    try {
      return await Notification.requestPermission();
    } catch (err) {
      console.warn('Error requesting Web notification permission:', err);
      return Notification.permission || 'denied';
    }
  }

  return 'denied';
}

/**
 * Converts a Blob to a Base64 data string (needed for Android WebView JavaScriptInterface)
 */
export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      // Strip metadata header e.g. "data:application/pdf;base64,"
      const base64 = result.includes(',') ? result.split(',')[1] : result;
      resolve(base64);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Saves or shares a file directly to the Android device.
 * Priority order:
 * 1. Web Share API (Android native share sheet: lets student save to Downloads, Drive, WhatsApp, PDF Viewer)
 * 2. Android Studio Native Bridge (`window.Android.saveFile` or `window.AndroidBridge.saveBase64File`)
 * 3. Browser Blob download fallback
 */
export async function saveFileToDevice(
  blob: Blob,
  filename: string,
  mimeType: string,
  title: string = 'Horario UniGuajira'
): Promise<{ success: boolean; method: string; base64?: string }> {
  // Make sure storage persistence is active
  requestDeviceStoragePermission().catch(() => {});

  let base64Cache: string | null = null;
  const getBase64 = async () => {
    if (!base64Cache) {
      base64Cache = await blobToBase64(blob);
    }
    return base64Cache;
  };

  // 1. Try Android Native Share Sheet (Works seamlessly in Android Chrome, PWA & WebView with WebChromeClient)
  if (typeof navigator !== 'undefined' && navigator.share && navigator.canShare) {
    try {
      const file = new File([blob], filename, { type: mimeType });
      if (navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title,
          text: `${title} - Universidad de La Guajira`
        });
        return { success: true, method: 'native_share' };
      }
    } catch (shareErr: any) {
      if (shareErr?.name === 'AbortError') {
        return { success: true, method: 'native_share_cancelled' };
      }
      console.warn('Web Share API failed or was rejected, falling back to Android bridge/download:', shareErr);
    }
  }

  // 2. Try Android Studio / Converter Native Bridge methods
  if (typeof window !== 'undefined') {
    try {
      const b64 = await getBase64();
      const dataUri = `data:${mimeType};base64,${b64}`;

      if (window.Android?.saveFile) {
        window.Android.saveFile(filename, b64, mimeType);
        return { success: true, method: 'android_bridge_saveFile', base64: b64 };
      }
      if (window.AndroidBridge?.saveBase64File) {
        window.AndroidBridge.saveBase64File(filename, b64, mimeType);
        return { success: true, method: 'android_bridge_saveBase64', base64: b64 };
      }
      if (window.Android?.downloadBase64File) {
        window.Android.downloadBase64File(filename, b64, mimeType);
        return { success: true, method: 'android_bridge_downloadBase64', base64: b64 };
      }
      if (window.Android?.downloadFile) {
        window.Android.downloadFile(filename, dataUri);
        return { success: true, method: 'android_bridge_downloadFile', base64: b64 };
      }
      if (window.AndroidBridge?.downloadFile) {
        window.AndroidBridge.downloadFile(filename, dataUri);
        return { success: true, method: 'android_bridge_downloadUrl', base64: b64 };
      }
      if (window.JSInterface?.saveFile) {
        window.JSInterface.saveFile(filename, b64);
        return { success: true, method: 'jsinterface_saveFile', base64: b64 };
      }
    } catch (bridgeErr) {
      console.warn('Android bridge save attempt threw an error, trying download:', bridgeErr);
    }
  }

  // 3. Dual Anchor Download (Blob URL + Data URI fallback for Android WebViews)
  try {
    const b64 = await getBase64();
    const dataUri = `data:${mimeType};base64,${b64}`;
    const blobUrl = URL.createObjectURL(blob);

    // Try Blob URL first
    const link = document.createElement('a');
    link.href = blobUrl;
    link.setAttribute('download', filename);
    link.style.display = 'none';
    document.body.appendChild(link);
    link.click();

    // In Android WebView, blob: links are frequently ignored without an error.
    // Also trigger data URI as a fallback in the background
    if (isAndroidDevice()) {
      setTimeout(() => {
        try {
          const dataLink = document.createElement('a');
          dataLink.href = dataUri;
          dataLink.setAttribute('download', filename);
          dataLink.style.display = 'none';
          document.body.appendChild(dataLink);
          dataLink.click();
          setTimeout(() => {
            if (dataLink.parentNode) dataLink.parentNode.removeChild(dataLink);
          }, 1000);
        } catch {
          // Ignore
        }
      }, 300);
    }

    setTimeout(() => {
      if (link.parentNode) link.parentNode.removeChild(link);
      URL.revokeObjectURL(blobUrl);
    }, 2000);

    return { success: true, method: 'blob_and_data_download', base64: b64 };
  } catch (err) {
    console.error('All automatic download methods failed:', err);
    const b64 = await getBase64().catch(() => undefined);
    return { success: false, method: 'failed', base64: b64 };
  }
}

/**
 * Triggers native haptic vibration on Android device
 */
export function vibrateDevice(pattern: number | number[] = [150, 80, 150]): void {
  if (typeof window !== 'undefined' && window.Android?.vibrate) {
    try {
      window.Android.vibrate(Array.isArray(pattern) ? pattern[0] : pattern);
      return;
    } catch {}
  }
  if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
    try {
      navigator.vibrate(pattern);
    } catch {}
  }
}
