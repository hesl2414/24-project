from __future__ import annotations

from typing import Any

from sqlalchemy.orm import Session

from app.repositories.agent_repository import AgentRepository
from app.services.chat_service import ChatService
from app.llm.llm_factory import LLMFactory


class AgentService:
    def __init__(self, agent_repository: AgentRepository, chat_service: ChatService):
        self.agent_repository = agent_repository
        self.chat_service = chat_service

        self.max_recent_messages = 12
        self.summary_trigger_count = 20
        self.max_summary_source_messages = 40

    def list_agents(self):
        return self.agent_repository.list_agents()

    def invoke_agent(
        self,
        db: Session,
        agent_code: str,
        user_id: str,
        message: str,
        chat_id: str | None = None,
    ) -> dict[str, Any]:
        agent = self.agent_repository.get(agent_code)
        if not agent:
            raise ValueError(f"등록되지 않은 agent code 입니다: {agent_code}")

        if chat_id:
            session = self.chat_service.get_chat(db, chat_id)
            if not session:
                raise ValueError(f"존재하지 않는 chat_id 입니다: {chat_id}")
        else:
            session = self.chat_service.create_chat(
                db=db,
                user_id=user_id,
                title=message[:30] if message else "New Chat",
                agent_code=agent_code,
            )
            chat_id = session.chat_id

        self.chat_service.add_message(
            db=db,
            chat_id=chat_id,
            role="user",
            content=message,
            agent_code=agent_code,
        )

        run_log = self.chat_service.create_run_log(
            db=db,
            chat_id=chat_id,
            agent_code=agent_code,
            user_message=message,
            model_name=LLMFactory.get_model_name(),
        )

        try:
            session = self.chat_service.get_chat(db, chat_id)
            chat_messages = self.chat_service.get_messages(db, chat_id)

            llm_messages = self._build_llm_messages(
                session=session,
                chat_messages=chat_messages,
                agent=agent,
            )

            assistant_text = self._call_llm(llm_messages)

            self.chat_service.add_message(
                db=db,
                chat_id=chat_id,
                role="assistant",
                content=assistant_text,
                agent_code=agent_code,
            )

            updated_messages = self.chat_service.get_messages(db, chat_id)
            self._refresh_summary_if_needed(
                db=db,
                chat_id=chat_id,
                session=session,
                chat_messages=updated_messages,
                agent=agent,
            )

            self.chat_service.complete_run_log(
                db=db,
                run_id=run_log.run_id,
                assistant_message=assistant_text,
                used_tools=None,
            )

            return {
                "chat_id": chat_id,
                "agent_code": agent_code,
                "user_message": message,
                "assistant_message": assistant_text,
                "used_tools": [],
            }

        except Exception as e:
            self.chat_service.fail_run_log(
                db=db,
                run_id=run_log.run_id,
                error_message=str(e),
            )
            raise

    def _build_llm_messages(
        self,
        session,
        chat_messages: list,
        agent,
    ) -> list[dict[str, str]]:
        system_prompt = agent.get_system_prompt()
        converted = self._convert_chat_messages(chat_messages)

        llm_messages: list[dict[str, str]] = [
            {"role": "system", "content": system_prompt}
        ]

        if session and session.summary_text:
            llm_messages.append(
                {
                    "role": "system",
                    "content": (
                        "Summary of earlier conversation context:\n"
                        f"{session.summary_text}"
                    ),
                }
            )

        recent_messages = converted[-self.max_recent_messages :]
        llm_messages.extend(recent_messages)
        return llm_messages

    def _convert_chat_messages(self, chat_messages: list) -> list[dict[str, str]]:
        converted: list[dict[str, str]] = []

        for msg in chat_messages:
            role = (msg.role or "").lower()
            if role not in {"user", "assistant", "system"}:
                continue

            content = (msg.content or "").strip()
            if not content:
                continue

            converted.append({"role": role, "content": content})

        return converted

    def _refresh_summary_if_needed(
        self,
        db: Session,
        chat_id: str,
        session,
        chat_messages: list,
        agent,
    ) -> None:
        converted = self._convert_chat_messages(chat_messages)

        if len(converted) < self.summary_trigger_count:
            return

        old_messages = converted[:-self.max_recent_messages]
        if not old_messages:
            return

        summary_source = old_messages[-self.max_summary_source_messages :]
        summary_text = self._summarize_messages(agent, summary_source)

        if summary_text:
            self.chat_service.update_session_summary(
                db=db,
                chat_id=chat_id,
                summary_text=summary_text,
            )

    def _summarize_messages(
        self,
        agent,
        messages: list[dict[str, str]],
    ) -> str:
        if not messages:
            return ""

        lines = [f"{m['role']}: {m['content']}" for m in messages]
        summary_input = "\n".join(lines)

        client = LLMFactory.get_client()
        model = LLMFactory.get_model_name()

        response = client.responses.create(
            model=model,
            instructions=(
                f"You are summarizing prior conversation for {agent.name}.\n"
                "Summarize in Korean.\n"
                "Keep only important context, user goals, entities, unresolved issues, and prior conclusions.\n"
                "Be concise and factual."
            ),
            input=summary_input,
        )

        return (response.output_text or "").strip()

    def _call_llm(self, llm_messages: list[dict[str, str]]) -> str:
        client = LLMFactory.get_client()
        model = LLMFactory.get_model_name()

        response = client.responses.create(
            model=model,
            input=llm_messages,
        )

        return (response.output_text or "").strip()