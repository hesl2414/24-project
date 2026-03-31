// ============================================
// src/router/AdminRouter.tsx
// ============================================
import { Navigate, Route, Routes } from "react-router-dom";
import AdminLayout from "../components/admin/AdminLayout";
import DashboardPage from "../pages/admin/DashboardPage";
import ChatListPage from "../pages/admin/ChatListPage";
import ChatDetailPage from "../pages/admin/ChatDetailPage";
import RunListPage from "../pages/admin/RunListPage";
import RunDetailPage from "../pages/admin/RunDetailPage";
import AgentListPage from "../pages/admin/AgentListPage";

export default function AdminRouter() {
  return (
    <Routes>
      <Route path="/" element={<AdminLayout />}>
        <Route index element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="chats" element={<ChatListPage />} />
        <Route path="chats/:chatId" element={<ChatDetailPage />} />
        <Route path="runs" element={<RunListPage />} />
        <Route path="runs/:runId" element={<RunDetailPage />} />
        <Route path="agents" element={<AgentListPage />} />
      </Route>
    </Routes>
  );
}