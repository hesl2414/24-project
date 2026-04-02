import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AgentChatDashboard from "./pages/AgentChatDashboard";
import AdminRouter from "./router/AdminRouter";

export default function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/chat" replace />} />
        <Route path="/chat" element={<AgentChatDashboard />} />
        <Route path="/admin/*" element={<AdminRouter />} />
      </Routes>
    </BrowserRouter>
  );
}