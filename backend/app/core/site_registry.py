# =========================================
# app/core/site_registry.py
# =========================================
from app.core.site_context import SiteContext


SITE_CONTEXTS = {
    "CN": SiteContext(
        site_code="CN",
        db_roles={
            "source": "eam_if_cn",
            "request": "md_req_cn",
            "final": "eam_master_cn",
            "error_log": "batch_log_cn",
        },
        table_names={
            "source": "EAM_MD_NEW_EQPID_IF",
            "request": "EAM_EQP_REQUEST",

            # final 여러 개
            "final_main": "EAM_EQP_MASTER",
            "final_attr": "EAM_EQP_ATTR",
            "final_hist": "EAM_EQP_HIST",

            # error log 3종류
            "error_log_etl": "EAM_EQP_ETL_ERR_LOG",
            "error_log_request_process": "EAM_EQP_REQ_PROC_ERR_LOG",
            "error_log_request_validation": "EAM_EQP_REQ_VALID_ERR_LOG",
        },
        alias_profile="cn",
        mapping_profile="cn",
        extra_config={},
    ),
}