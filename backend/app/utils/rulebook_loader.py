from pathlib import Path
import yaml


class RulebookLoader:
    INTENT_TO_FILE = {
        "BOM_CREATE_CHECK": "bom_create_check.yaml",
        "MATERIAL_REGISTRATION_CHECK": "material_registration_check.yaml",
        "COLUMN_TRACE_CHECK": "column_trace_check.yaml",
    }

    def __init__(self):
        self.base_path = Path(__file__).resolve().parents[1] / "rulebooks" / "bom_ops"

    def load_by_intent(self, intent: str) -> dict:
        filename = self.INTENT_TO_FILE.get(intent)
        if not filename:
            raise ValueError(f"지원하지 않는 intent: {intent}")

        file_path = self.base_path / filename
        if not file_path.exists():
            raise FileNotFoundError(f"Rulebook 파일이 없습니다: {file_path}")

        with open(file_path, "r", encoding="utf-8") as f:
            return yaml.safe_load(f)