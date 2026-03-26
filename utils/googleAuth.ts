/**
 * Fetches Google user info using an OAuth access token.
 * Used after expo-auth-session Google flow to get email/name for backend.
 */
const USERINFO_URL = "https://openidconnect.googleapis.com/v1/userinfo";

export interface GoogleUserInfo {
  email: string;
  given_name?: string;
  family_name?: string;
  name?: string;
}

export async function fetchGoogleUserInfo(
  accessToken: string
): Promise<{ email: string; firstName: string; lastName: string }> {
  const res = await fetch(USERINFO_URL, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch Google user info");
  }
  const data: GoogleUserInfo = await res.json();
  const email = data.email?.trim();
  if (!email) {
    throw new Error("Google account did not provide an email");
  }
  const firstName =
    data.given_name?.trim() ||
    data.name?.split(/\s+/)[0]?.trim() ||
    "User";
  const lastName =
    data.family_name?.trim() ||
    data.name?.split(/\s+/).slice(1).join(" ").trim() ||
    "";
  return { email, firstName, lastName };
}

export function getGoogleWebClientId(): string | undefined {
  return (
    process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID ||
    process.env.EXPO_PUBLIC_GOOGLE_MAPS_CLIENT_ID ||
    undefined
  );
}

export function getGoogleIosClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined;
}

export function getGoogleAndroidClientId(): string | undefined {
  return process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined;
}
