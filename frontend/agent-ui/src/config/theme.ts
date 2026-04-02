export const SITE_OPTIONS = [
  "KOR-SEOUL",
  "KOR-CHEONAN",
  "VN-HANOI",
  "CN-SUZHOU",
  "ADMIN",
] as const;

export type SiteOption = (typeof SITE_OPTIONS)[number];

export const DEFAULT_SITE: SiteOption = "KOR-SEOUL";

export function isAdminSite(site: string): boolean {
  return site === "ADMIN";
}
