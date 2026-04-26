import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'ai.monibox.app',
  appName: 'Monibox',
  webDir: 'www',
  server: {
    url: 'https://monibox.ai',
    cleartext: false,
    allowNavigation: [
      'monibox.ai', '*.monibox.ai', '*.supabase.co',
      'accounts.google.com', 'login.microsoftonline.com', 'api.monibox.ai'
    ]
  },
  ios: {
    contentInset: 'always',
    backgroundColor: '#1a2e23',
    preferredContentMode: 'mobile',
    scheme: 'monibox',
    scrollEnabled: true,
    allowsLinkPreview: false,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000, launchAutoHide: true,
      backgroundColor: '#1a2e23', showSpinner: false,
      launchFadeOutDuration: 500, splashFullScreen: true, splashImmersive: true,
    },
    StatusBar: { style: 'DARK', backgroundColor: '#1a2e23' },
    Keyboard: { resize: 'body', resizeOnFullScreen: true },
  }
};

export default config;
