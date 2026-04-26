/**
 * Monibox Native Bridge
 *
 * This script is injected into the WKWebView to provide native iOS capabilities
 * to the Monibox web app. It exposes a `window.MoniboxNative` API that the web
 * app can use to interact with native features.
 */

(function() {
  'use strict';

  // Only run inside Capacitor
  if (!window.Capacitor) return;

  const { Haptics } = window.Capacitor.Plugins;
  const { StatusBar } = window.Capacitor.Plugins;
  const { App } = window.Capacitor.Plugins;
  const { Keyboard } = window.Capacitor.Plugins;
  const { SplashScreen } = window.Capacitor.Plugins;

  // ─── Native Bridge API ───────────────────────────────────
  window.MoniboxNative = {
    isNative: true,
    platform: 'ios',

    // Haptic feedback
    haptic: {
      light: () => Haptics?.impact({ style: 'LIGHT' }),
      medium: () => Haptics?.impact({ style: 'MEDIUM' }),
      heavy: () => Haptics?.impact({ style: 'HEAVY' }),
      success: () => Haptics?.notification({ type: 'SUCCESS' }),
      warning: () => Haptics?.notification({ type: 'WARNING' }),
      error: () => Haptics?.notification({ type: 'ERROR' }),
      selection: () => Haptics?.selectionStart(),
    },

    // Status bar control
    statusBar: {
      hide: () => StatusBar?.hide(),
      show: () => StatusBar?.show(),
      setDark: () => StatusBar?.setStyle({ style: 'DARK' }),
      setLight: () => StatusBar?.setStyle({ style: 'LIGHT' }),
    },

    // App lifecycle
    app: {
      exitApp: () => App?.exitApp(),
      getInfo: () => App?.getInfo(),
      getLaunchUrl: () => App?.getLaunchUrl(),
    },

    // In-App Purchase (will be wired up in IAP module)
    iap: {
      available: false,
      products: [],
      purchase: async (productId) => {
        console.log('[MoniboxNative] IAP purchase requested:', productId);
        // Will be implemented when IAP plugin is added
        return { success: false, message: 'IAP not yet configured' };
      },
      restore: async () => {
        console.log('[MoniboxNative] IAP restore requested');
        return { success: false, message: 'IAP not yet configured' };
      },
    },

    // Keyboard
    keyboard: {
      hide: () => Keyboard?.hide(),
    },

    // Splash screen
    splash: {
      hide: () => SplashScreen?.hide(),
      show: () => SplashScreen?.show(),
    },
  };

  // ─── Back Button Handler ─────────────────────────────────
  App?.addListener('backButton', ({ canGoBack }) => {
    if (canGoBack) {
      window.history.back();
    }
  });

  // ─── Deep Link Handler ───────────────────────────────────
  App?.addListener('appUrlOpen', (event) => {
    const url = event.url;
    console.log('[MoniboxNative] Deep link:', url);
    // Handle monibox:// deep links
    if (url.startsWith('monibox://')) {
      const path = url.replace('monibox://', '/');
      window.location.hash = path;
    }
  });

  // ─── Keyboard Handlers ──────────────────────────────────
  Keyboard?.addListener('keyboardWillShow', (info) => {
    document.body.style.setProperty('--keyboard-height', `${info.keyboardHeight}px`);
    document.body.classList.add('keyboard-visible');
  });

  Keyboard?.addListener('keyboardWillHide', () => {
    document.body.style.setProperty('--keyboard-height', '0px');
    document.body.classList.remove('keyboard-visible');
  });

  // ─── Disable Long Press Context Menu ─────────────────────
  document.addEventListener('contextmenu', (e) => e.preventDefault());

  // ─── Disable Pull-to-Refresh ─────────────────────────────
  let startY = 0;
  document.addEventListener('touchstart', (e) => {
    startY = e.touches[0].pageY;
  }, { passive: true });

  document.addEventListener('touchmove', (e) => {
    const y = e.touches[0].pageY;
    const scrollTop = document.scrollingElement?.scrollTop || 0;
    if (scrollTop <= 0 && y > startY) {
      e.preventDefault();
    }
  }, { passive: false });

  // ─── Notify Web App ──────────────────────────────────────
  console.log('[MoniboxNative] Bridge loaded — native features available');

  // Dispatch event so the web app knows native bridge is ready
  window.dispatchEvent(new CustomEvent('monibox-native-ready', {
    detail: { platform: 'ios', version: '1.0.0' }
  }));

})();
