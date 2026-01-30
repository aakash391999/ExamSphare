import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.examsphere.app',
  appName: 'Examsphere',
  webDir: 'dist',
  plugins: {
    StatusBar: {
      style: 'dark',
      text: 'darkText',
      backgroundColor: '#ffffffff',
      overlaysWebView: true,
    },
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
  },
};

export default config;
