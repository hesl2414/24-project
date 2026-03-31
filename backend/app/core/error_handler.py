from __future__ import annotations

from typing import Optional

from sqlalchemy.exc import OperationalError, ProgrammingError


def to_user_friendly_message(error: Exception) -> str:
    error_text = str(error)

    # SQLite / DB 공통
    if "no such table" in error_text.lower():
        return "점검에 필요한 테이블을 찾을 수 없습니다. 현재 테스트 DB 또는 연결된 DB 구성을 확인해주세요."

    if "no such column" in error_text.lower():
        return "점검에 필요한 컬럼을 찾을 수 없습니다. 테이블 구조를 확인해주세요."

    if "syntax error" in error_text.lower():
        return "점검용 쿼리 실행 중 문법 오류가 발생했습니다. 관리자 확인이 필요합니다."

    if "session's transaction has been rolled back" in error_text.lower():
        return "이전 DB 처리 실패로 현재 작업을 이어서 진행할 수 없습니다. 다시 시도해주세요."

    if "type 'list' is not supported" in error_text.lower():
        return "내부 로그 저장 형식 오류가 발생했습니다. 관리자 확인이 필요합니다."

    if isinstance(error, OperationalError):
        return "DB 조회 중 오류가 발생했습니다. 연결 정보나 테이블 상태를 확인해주세요."

    if isinstance(error, ProgrammingError):
        return "DB 실행 중 오류가 발생했습니다. 쿼리 또는 스키마 구성을 확인해주세요."

    return "처리 중 오류가 발생했습니다. 잠시 후 다시 시도하거나 관리자에게 문의해주세요."