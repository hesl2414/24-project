import { useEffect, useState } from "react";
import { DEFAULT_SITE, type SiteOption } from "../config/theme";

const SITE_STORAGE_KEY = "agent-ui-site";

export function useSitePreference() {
  const [site, setSiteState] = useState<SiteOption>(() => {
    const saved = window.localStorage.getItem(SITE_STORAGE_KEY);
    return (saved as SiteOption) || DEFAULT_SITE;
  });

  useEffect(() => {
    window.localStorage.setItem(SITE_STORAGE_KEY, site);
  }, [site]);

  function setSite(nextSite: string) {
    setSiteState(nextSite as SiteOption);
  }

  return { site, setSite };
}
