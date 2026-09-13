// Helper utility for Progressive Web App (PWA) installation on PC and Mobile devices

export interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed'; platform: string }>;
}

let globalDeferredPrompt: BeforeInstallPromptEvent | null = null;
const listeners = new Set<(prompt: BeforeInstallPromptEvent | null) => void>();

// Initialize event capture early
if (typeof window !== 'undefined') {
  // Capture the native beforeinstallprompt event
  window.addEventListener('beforeinstallprompt', (e: Event) => {
    e.preventDefault();
    globalDeferredPrompt = e as BeforeInstallPromptEvent;
    (window as any).__pwaInstallPrompt = e;
    listeners.forEach((listener) => listener(globalDeferredPrompt));
  });

  // Track when app is installed successfully
  window.addEventListener('appinstalled', () => {
    globalDeferredPrompt = null;
    (window as any).__pwaInstallPrompt = null;
    listeners.forEach((listener) => listener(null));
  });
}

export function subscribeToInstallPrompt(callback: (prompt: BeforeInstallPromptEvent | null) => void) {
  listeners.add(callback);
  callback(globalDeferredPrompt);
  return () => {
    listeners.delete(callback);
  };
}

export function getDeferredPrompt(): BeforeInstallPromptEvent | null {
  return globalDeferredPrompt || (typeof window !== 'undefined' ? (window as any).__pwaInstallPrompt : null);
}

export function isAppInstalled(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    window.matchMedia('(display-mode: window-controls-overlay)').matches ||
    (window.navigator as unknown as { standalone?: boolean }).standalone === true
  );
}

export function isRunningInIframe(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    return window.self !== window.top;
  } catch {
    return true;
  }
}

export function getDevicePlatform(): {
  isIOS: boolean;
  isAndroid: boolean;
  isDesktop: boolean;
  isWindows: boolean;
  isMac: boolean;
  browserName: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Other';
} {
  if (typeof navigator === 'undefined') {
    return {
      isIOS: false,
      isAndroid: false,
      isDesktop: true,
      isWindows: false,
      isMac: false,
      browserName: 'Other'
    };
  }

  const ua = navigator.userAgent.toLowerCase();
  const isIOS = /iphone|ipad|ipod/.test(ua);
  const isAndroid = /android/.test(ua);
  const isWindows = /windows/.test(ua);
  const isMac = /macintosh|mac os x/.test(ua) && !isIOS;
  const isDesktop = !isIOS && !isAndroid;

  let browserName: 'Chrome' | 'Edge' | 'Safari' | 'Firefox' | 'Other' = 'Other';
  if (ua.includes('edg/')) {
    browserName = 'Edge';
  } else if (ua.includes('chrome') && !ua.includes('edg/')) {
    browserName = 'Chrome';
  } else if (ua.includes('safari') && !ua.includes('chrome')) {
    browserName = 'Safari';
  } else if (ua.includes('firefox')) {
    browserName = 'Firefox';
  }

  return {
    isIOS,
    isAndroid,
    isDesktop,
    isWindows,
    isMac,
    browserName
  };
}

export async function triggerPWAInstall(): Promise<{ success: boolean; outcome?: 'accepted' | 'dismissed' }> {
  const prompt = getDeferredPrompt();
  if (!prompt) {
    return { success: false };
  }

  try {
    await prompt.prompt();
    const choice = await prompt.userChoice;
    if (choice.outcome === 'accepted') {
      globalDeferredPrompt = null;
      (window as any).__pwaInstallPrompt = null;
      listeners.forEach((l) => l(null));
      return { success: true, outcome: 'accepted' };
    }
    return { success: false, outcome: 'dismissed' };
  } catch (err) {
    console.warn('Error prompting PWA install:', err);
    return { success: false };
  }
}
