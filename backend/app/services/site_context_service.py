from app.core.site_registry import SITE_CONTEXTS
from app.core.site_context import SiteContext


class SiteContextService:
    def get_by_site_code(self, site_code: str) -> SiteContext:
        if not site_code:
            raise ValueError("site_code가 없습니다.")

        ctx = SITE_CONTEXTS.get(site_code)
        if not ctx:
            raise ValueError(f"지원하지 않는 site_code 입니다: {site_code}")
        return ctx