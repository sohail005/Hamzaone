export function assetUrl(storageKey: string) {
  return `/api/assets/${storageKey.split("/").map(encodeURIComponent).join("/")}`;
}
