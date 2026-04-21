export const SITE_OPTIONS = [
  "KOR-SEOUL",
  "KR",
  "CN",
  "VN",
  "ADMIN",
] as const;

export type SiteOption = (typeof SITE_OPTIONS)[number];

export const DEFAULT_SITE: SiteOption = "KOR-SEOUL";

export function isAdminSite(site: string): boolean {
  return site === "ADMIN";
}
