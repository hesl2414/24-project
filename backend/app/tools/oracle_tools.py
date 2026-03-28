from typing import Dict, List


class OracleTools:
    """
    집 연습용 mock tool.
    실제 Oracle 연결 대신 어떤 기능을 넣을지 형태만 연습.
    """

    @staticmethod
    def get_schema_summary(schema_name: str) -> Dict:
        sample_tables = {
            "HR": ["EMPLOYEES", "DEPARTMENTS", "JOBS"],
            "MES": ["WORK_ORDER", "PRODUCT", "BOM_ITEM"],
            "BOM": ["BOM_HEADER", "BOM_DETAIL", "MATERIAL"],
        }

        tables = sample_tables.get(schema_name.upper(), ["TABLE_A", "TABLE_B"])
        return {
            "schema_name": schema_name.upper(),
            "table_count": len(tables),
            "tables": tables,
        }

    @staticmethod
    def suggest_sample_queries(schema_name: str) -> List[str]:
        schema = schema_name.upper()
        return [
            f"SELECT * FROM {schema}.TABLE_NAME WHERE ROWNUM <= 10;",
            f"SELECT COUNT(*) FROM {schema}.TABLE_NAME;",
            f"SELECT COLUMN_NAME, DATA_TYPE FROM ALL_TAB_COLUMNS WHERE OWNER = '{schema}';",
        ]