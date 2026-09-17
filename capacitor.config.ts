import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.flydentify.app",
  appName: "Flydentify",
  webDir: "dist/public",
  server: {
    // During development, point to the live pplx.app URL so the full
    // backend (API, auth, SQLite) is available inside the native shell.
    // Comment this out (or remove) before final App Store build so the
    // app ships with the bundled dist/public web assets instead.
    // url: "https://flydentify.pplx.app",
    // androidScheme: "https",
  },
  ios: {
    contentInset: "always",          // respect safe-area / notch
    scrollEnabled: true,
    backgroundColor: "#071e25",      // matches app bg — no white flash on launch
    preferredContentMode: "mobile",
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#071e25",
      iosSpinnerStyle: "small",
      spinnerColor: "#d97706",        // amber brand accent
      showSpinner: false,
      splashFullScreen: true,
      splashImmersive: true,
    },
    StatusBar: {
      style: "Dark",                  // light text on dark bg
      backgroundColor: "#071e25",
    },
  },
};

export default config;
