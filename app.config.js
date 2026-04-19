// Load environment variables from .env file (optional; Expo also loads .env)
try {
  require("dotenv").config();
} catch {
  // dotenv not installed or Expo already loaded .env
}

module.exports = {
  expo: {
    name: "Al-Ihsan Zakat & Charity App",
    slug: "alihsan-mobile",
    owner: "alihsan2025s-organization",
    version: "1.0.2",
    orientation: "portrait",
    icon: "./assets/app-icon.png",
    userInterfaceStyle: "light",
    splash: {
      backgroundColor: "#264B8B",
      resizeMode: "contain",
    },
    assetBundlePatterns: ["**/*"],
    ios: {
      supportsTablet: true,
      bundleIdentifier: "org.alihsan.mobile",
      usesAppleSignIn: true,
      config: {
        googleMapsApiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
      },
      infoPlist: {
        NSCameraUsageDescription: "This app needs access to your camera to allow you to take photos for your profile or upload images.",
        NSPhotoLibraryUsageDescription: "This app needs access to your photo library to allow you to select and upload images.",
        NSPhotoLibraryAddUsageDescription: "This app needs access to save photos to your photo library.",
        NSLocationWhenInUseUsageDescription: "This app uses your location to show nearby campaigns and provide location-based services.",
        ITSAppUsesNonExemptEncryption: false,
      },
    },
    android: {
      googleServicesFile: "./google-services.json",
      adaptiveIcon: {
        backgroundColor: "#264B8B",
      },
      package: "org.alihsan.mobile",
      // expo-auth-session Google uses `${applicationId}:/oauthredirect`. iOS auto-adds the
      // bundle id as a URL scheme; Android does not—without this, the OAuth redirect never opens the app.
      scheme: "org.alihsan.mobile",
      config: {
        googleMaps: {
          apiKey: process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || "",
        },
      },
      intentFilters: [
        {
          action: "VIEW",
          data: [
            {
              scheme: "alihsan",
            },
          ],
          category: ["BROWSABLE", "DEFAULT"],
        },
      ],
    },
    web: {
      bundler: "metro",
    },
    scheme: "alihsan",
    plugins: [
      "expo-router",
      "expo-font",
      "expo-web-browser",
      "expo-secure-store",
      "expo-apple-authentication",
      "expo-video",
      [
        "@stripe/stripe-react-native",
        {
          merchantIdentifier: "merchant.au.org.alihsan.www",
          enableGooglePay: true,
        },
      ],
    ],
    extra: {
      router: {},
      eas: {
        projectId: "acdb8797-5055-407c-a49f-f5c99516013d",
      },
      // API URL will be set via environment variables during build
      apiUrl: process.env.EXPO_PUBLIC_API_URL,
      apiUrlDev: process.env.EXPO_PUBLIC_API_URL_DEV,
      EXPO_PUBLIC_STRIPE_KEY: process.env.EXPO_PUBLIC_STRIPE_KEY,
      EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
      EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    },
  },
};
