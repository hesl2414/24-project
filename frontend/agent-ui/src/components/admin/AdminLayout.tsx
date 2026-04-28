import { NavLink, Outlet, useNavigate } from "react-router-dom";
import SiteSelect from "../chat/SiteSelect";
import { isAdminSite } from "../../config/theme";
import { useSitePreference } from "../../hooks/useSitePreference";
import "./AdminLayout.css";

export default function AdminLayout() {
  const navigate = useNavigate();
  const { site, setSite } = useSitePreference();

  function handleSiteChange(value: string) {
    setSite(value);
    if (!isAdminSite(value)) {
      navigate("/chat");
    }
  }

  return (
    <div className="admin-layout">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-top">
          <SiteSelect site={site} onChange={handleSiteChange} />
        </div>

        <div className="admin-logo">AI Admin</div>

        <nav className="admin-nav">
          <NavLink to="/admin/dashboard" className="admin-nav-link">
            Dashboard
          </NavLink>
          <NavLink to="/admin/chats" className="admin-nav-link">
            Chats
          </NavLink>
          <NavLink to="/admin/runs" className="admin-nav-link">
            Runs
          </NavLink>
          <NavLink to="/admin/agents" className="admin-nav-link">
            Agents
          </NavLink>
          <NavLink to="/admin/pending-actions" className="admin-nav-link">
            Pending Actions
          </NavLink>
        </nav>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Console</h1>
            <p>채팅 / 실행 로그 / 에이전트 운영 화면</p>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
