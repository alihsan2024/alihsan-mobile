import { Redirect } from "expo-router";

/** Legacy path — canonical Qurban 2026 hub is `/(tabs)/qurban-2026`. */
export default function QurbanLegacyRedirect() {
  return <Redirect href="/(tabs)/qurban-2026" />;
}
