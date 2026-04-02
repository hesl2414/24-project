export const SITE_OPTIONS = [
  "CN",
  "KOR-SEOUL",
  "VN-HANOI",
  "ADMIN",
] as const;

export type SiteOption = (typeof SITE_OPTIONS)[number];

export const DEFAULT_SITE: SiteOption = "CN";

export function isAdminSite(site: string): boolean {
  return site === "ADMIN";
}
