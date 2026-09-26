
const API_URL = import.meta.env.VITE_API_URL || "";
export const ASSET_BASE_URL = API_URL.replace(/\/api\/?$/, "");

export function resolveAvatarUrl(avatar) {
  if (!avatar) return "";
  if (/^https?:\/\//i.test(avatar)) return avatar;
  if (ASSET_BASE_URL) return `${ASSET_BASE_URL}${avatar}`;
  return avatar;
}
