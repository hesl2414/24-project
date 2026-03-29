from __future__ import annotations

from typing import Any, Callable

from app.ai.utils.run_logger import RunLogger


class SimpleRuleExecutor:
    def __init__(
        self,
        tool_map: dict[str, Callable],
        run_logger: RunLogger | None = None,
    ):
        self.tool_map = tool_map
        self.run_logger = run_logger

    def _get_nested_value(self, data: dict[str, Any], path: str) -> Any:
        current = data
        for part in path.split("."):
            if isinstance(current, dict):
                current = current.get(part)
            else:
                return None
        return current

    def _check_condition(self, condition: dict[str, Any], data: dict[str, Any]) -> bool:
        if not condition:
            return True

        left_path = condition.get("left")
        op = condition.get("op")
        right = condition.get("right")

        value = self._get_nested_value(data, left_path)

        if op == "equals":
            return value == right
        if op == "not_equals":
            return value != right
        if op == "exists":
            return value is not None
        if op == "true":
            return value is True
        if op == "false":
            return value is False

        return False

    def execute(self, rulebook: dict[str, Any], context: dict[str, Any]) -> dict[str, Any]:
        steps_log: list[dict[str, Any]] = []
        data: dict[str, Any] = dict(context)
        final_message = ""

        for step in rulebook.get("steps", []):
            step_no = step.get("step")
            step_name = step.get("name")
            save_as = step.get("save_as")
            action = step.get("action")
            answer = step.get("answer")
            condition = step.get("when")

            try:
                if condition and not self._check_condition(condition, data):
                    skip_result = {
                        "step": step_no,
                        "name": step_name,
                        "skipped": True,
                        "reason": "condition_not_matched",
                    }
                    steps_log.append(skip_result)

                    if self.run_logger:
                        self.run_logger.log_skip(
                            step_no=step_no,
                            step_name=step_name,
                            input_data={"condition": condition},
                            output_data=skip_result,
                        )
                    continue

                if answer:
                    final_message = answer
                    answer_result = {
                        "step": step_no,
                        "name": step_name,
                        "answered": True,
                        "message": answer,
                    }
                    steps_log.append(answer_result)

                    if self.run_logger:
                        self.run_logger.log_answer(
                            step_no=step_no,
                            step_name=step_name,
                            output_data=answer_result,
                        )
                    break

                if action:
                    func = self.tool_map.get(action)
                    if not func:
                        raise ValueError(f"등록되지 않은 action 입니다: {action}")

                    result = func(data)

                    if save_as:
                        data[save_as] = result

                    step_result = {
                        "step": step_no,
                        "name": step_name,
                        "action": action,
                        "save_as": save_as,
                        "result": result,
                    }
                    steps_log.append(step_result)

                    if self.run_logger:
                        self.run_logger.log_step(
                            step_no=step_no,
                            step_name=step_name,
                            tool_name=action,
                            input_data={"context": data, "save_as": save_as},
                            output_data=step_result,
                            status="SUCCESS",
                        )

            except Exception as e:
                error_result = {
                    "step": step_no,
                    "name": step_name,
                    "action": action,
                    "error": str(e),
                }
                steps_log.append(error_result)

                if self.run_logger:
                    self.run_logger.log_error(
                        step_no=step_no,
                        step_name=step_name,
                        tool_name=action,
                        input_data={"context": data, "condition": condition, "save_as": save_as},
                        error_message=str(e),
                    )

                return {
                    "steps": steps_log,
                    "data": data,
                    "final_message": final_message,
                    "success": False,
                    "error": str(e),
                    "failed_step": step_no,
                }

        return {
            "steps": steps_log,
            "data": data,
            "final_message": final_message,
            "success": True,
            "error": None,
            "failed_step": None,
        }