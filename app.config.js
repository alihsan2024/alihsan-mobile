module.exports = {
  expo: {
    name: "Al-Ihsan Foundation App",
    slug: "alihsan-mobile",
    owner: "alihsan2025s-organization",
    version: "1.0.0",
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
      config: {
        googleMapsApiKey: "AIzaSyAr-lr0NLXtT58Q53qE53uvLQU5u8wHa9Y",
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
      config: {
        googleMaps: {
          apiKey: "AIzaSyAr-lr0NLXtT58Q53qE53uvLQU5u8wHa9Y",
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
    plugins: ["expo-router", "expo-font", "expo-web-browser"],
    extra: {
      router: {},
      eas: {
        projectId: "acdb8797-5055-407c-a49f-f5c99516013d",
      },
      // API URL will be set via environment variables during build
      apiUrl: process.env.EXPO_PUBLIC_API_URL || "https://deenstream.live",
      apiUrlDev: process.env.EXPO_PUBLIC_API_URL_DEV || "http://192.168.20.16:4001",
      EXPO_PUBLIC_STRIPE_KEY:
        process.env.EXPO_PUBLIC_STRIPE_KEY ||
        "pk_test_5178emeJJ6oohcr5ljBoClAZ2tL10lPsY0XVNjPyhnogfrYN649N0EAt5B33Q0jf6QjvpOmqoOgmvmh8o0fn0BHvj00ULR40DFl",
    },
  },
};
