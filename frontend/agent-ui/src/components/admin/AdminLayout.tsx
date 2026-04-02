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
          <SiteSelect site={site} onChange={handleSiteChange} label="Admin Site" />
        </div>

        <div className="admin-brand">
          <div className="admin-brand-badge">Hyundai Deep Blue</div>
          <div className="admin-logo">AI Admin Console</div>
          <p className="admin-brand-copy">
            채팅, 실행 로그, 에이전트 운영 현황을 한 화면에서 관리하는 운영자 전용 대시보드
          </p>
        </div>

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
        </nav>

        <div className="admin-sidebar-bottom">
          <div className="admin-sidebar-bottom-label">Current Context</div>
          <div className="admin-sidebar-bottom-value">{site}</div>
        </div>
      </aside>

      <main className="admin-main">
        <header className="admin-header">
          <div>
            <h1>Admin Console</h1>
            <p>채팅 이력, 실행 추적, 에이전트 운영 현황을 관리하는 현대차 스타일 운영 화면</p>
          </div>

          <div className="admin-header-meta">
            <span className="admin-chip">Operator View</span>
            <span className="admin-chip admin-chip--accent">Deep Blue UI</span>
          </div>
        </header>

        <section className="admin-content">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
