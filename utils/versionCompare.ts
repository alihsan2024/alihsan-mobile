/** Parse semver-like strings (e.g. "1.0.4", "v1.2") into numeric segments. */
export function parseVersion(version: string): number[] {
  return version
    .trim()
    .replace(/^v/i, "")
    .split(".")
    .map((part) => {
      const match = part.match(/^\d+/);
      return match ? parseInt(match[0], 10) : 0;
    });
}

/** True when `current` is strictly older than `target`. */
export function isVersionLessThan(current: string, target: string): boolean {
  const a = parseVersion(current);
  const b = parseVersion(target);
  const len = Math.max(a.length, b.length);

  for (let i = 0; i < len; i += 1) {
    const av = a[i] ?? 0;
    const bv = b[i] ?? 0;
    if (av < bv) return true;
    if (av > bv) return false;
  }
  return false;
}
