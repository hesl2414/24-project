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
            "final": "EAM_EQP_MASTER",
            "error_log": "EAM_EQP_ERROR_LOG",
        },
        alias_profile="cn",
        mapping_profile="cn",
        extra_config={},
    ),
    "WS": SiteContext(
        site_code="WS",
        db_roles={
            "source": "eam_if_ws",
            "request": "md_req_ws",
            "final": "eam_master_ws",
            "error_log": "batch_log_ws",
        },
        table_names={
            "source": "EAM_MD_NEW_EQPID_IF",
            "request": "EAM_EQP_REQUEST",
            "final": "EAM_EQP_MASTER",
            "error_log": "EAM_EQP_ERROR_LOG",
        },
        alias_profile="ws",
        mapping_profile="ws",
        extra_config={},
    ),
}