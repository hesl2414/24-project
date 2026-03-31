from dataclasses import dataclass
from typing import Dict, Optional


@dataclass
class SiteContext:
    site_code: str
    db_roles: Dict[str, str]
    table_names: Dict[str, str]
    alias_profile: str
    mapping_profile: str
    extra_config: Optional[dict] = None