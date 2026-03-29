from typing import Any, Optional

from app.repositories.chat_run_log_repository import ChatRunLogRepository


class RunLogger:
    def __init__(self, repo: ChatRunLogRepository, run_id: str):
        self.repo = repo
        self.run_id = run_id
        self.used_tools: list[str] = []

    def add_used_tool(self, tool_name: Optional[str]) -> None:
        if tool_name and tool_name not in self.used_tools:
            self.used_tools.append(tool_name)

    def log_route(self, input_data: Any, output_data: Any) -> None:
        self.repo.add_step_log(
            run_id=self.run_id,
            log_type="ROUTE",
            step_no=0,
            step_name="route_question",
            tool_name="llm_router",
            input_data=input_data,
            output_data=output_data,
            status="SUCCESS",
        )

    def log_rulebook(self, input_data: Any, output_data: Any) -> None:
        self.repo.add_step_log(
            run_id=self.run_id,
            log_type="RULEBOOK",
            step_no=0,
            step_name="load_rulebook",
            tool_name="rulebook_loader",
            input_data=input_data,
            output_data=output_data,
            status="SUCCESS",
        )

    def log_step(
        self,
        step_no: Optional[int],
        step_name: Optional[str],
        tool_name: Optional[str],
        input_data: Any = None,
        output_data: Any = None,
        status: str = "SUCCESS",
    ) -> None:
        self.add_used_tool(tool_name)
        self.repo.add_step_log(
            run_id=self.run_id,
            log_type="STEP",
            step_no=step_no,
            step_name=step_name,
            tool_name=tool_name,
            input_data=input_data,
            output_data=output_data,
            status=status,
        )

    def log_skip(
        self,
        step_no: Optional[int],
        step_name: Optional[str],
        input_data: Any = None,
        output_data: Any = None,
    ) -> None:
        self.repo.add_step_log(
            run_id=self.run_id,
            log_type="SKIP",
            step_no=step_no,
            step_name=step_name,
            input_data=input_data,
            output_data=output_data,
            status="SKIPPED",
        )

    def log_answer(
        self,
        step_no: Optional[int],
        step_name: Optional[str],
        output_data: Any = None,
    ) -> None:
        self.repo.add_step_log(
            run_id=self.run_id,
            log_type="ANSWER",
            step_no=step_no,
            step_name=step_name,
            output_data=output_data,
            status="SUCCESS",
        )

    def log_error(
        self,
        step_no: Optional[int] = None,
        step_name: Optional[str] = None,
        tool_name: Optional[str] = None,
        input_data: Any = None,
        error_message: Optional[str] = None,
    ) -> None:
        self.add_used_tool(tool_name)
        self.repo.add_step_log(
            run_id=self.run_id,
            log_type="ERROR",
            step_no=step_no,
            step_name=step_name,
            tool_name=tool_name,
            input_data=input_data,
            status="FAILED",
            error_message=error_message,
        )

    def log_end(self, output_data: Any = None, status: str = "SUCCESS") -> None:
        self.repo.add_step_log(
            run_id=self.run_id,
            log_type="END",
            step_no=999,
            step_name="end",
            output_data=output_data,
            status=status,
        )