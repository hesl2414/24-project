import { useState } from "react";
import ChatMessage from "../components/ChatMessage";

export default function AgentChat() {
  const [messages, setMessages] = useState<any[]>([]);
  const [input, setInput] = useState("");

  const sendMessage = async () => {
    const res = await fetch("/api/chat/send", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ message: input }),
    });

    const data = await res.json();

    setMessages((prev) => [...prev, data]);
    setInput("");
  };

  return (
    <div className="p-4 max-w-xl mx-auto">
      <div className="mb-4">
        {messages.map((m, idx) => (
          <ChatMessage key={idx} message={m} />
        ))}
      </div>

      <div className="flex gap-2">
        <input
          className="border p-2 flex-1"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button
          className="bg-blue-500 text-white px-3"
          onClick={sendMessage}
        >
          전송
        </button>
      </div>
    </div>
  );
}