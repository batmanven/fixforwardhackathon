import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard, Map, Bell, Route, Building2,
  TrendingUp, UserPlus, Fuel
} from 'lucide-react';
import { stats } from '../../data/msmeData';

export default function Sidebar({ isOpen, onClose }) {

  const navItems = [
    { section: 'Intelligence' },
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard', badge: null },
    { path: '/map', icon: Map, label: 'Risk Map', badge: null },
    { path: '/alerts', icon: Bell, label: 'Shutdown Alerts', badge: stats.redUnits },
    { path: '/rerouting', icon: Route, label: 'Fuel Rerouting', badge: null },
    { section: 'Administration' },
    { path: '/district', icon: Building2, label: 'District Reports', badge: null },
    { path: '/impact', icon: TrendingUp, label: 'Impact Dashboard', badge: null },
    { section: 'Onboarding' },
    { path: '/register', icon: UserPlus, label: 'IVR Simulator', badge: null },
  ];

  return (
    <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Fuel size={22} color="white" />
        </div>
        <div className="sidebar-logo-text">
          <h1>MERP</h1>
          <p>Fuel Intelligence</p>
        </div>
      </div>

      <nav className="sidebar-nav">
        {navItems.map((item, i) => {
          if (item.section) {
            return <div key={i} className="nav-section-title">{item.section}</div>;
          }
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              onClick={onClose}
            >
              <Icon size={20} className="nav-item-icon" />
              <span>{item.label}</span>
              {item.badge && (
                <span className="nav-item-badge">{item.badge}</span>
              )}
            </NavLink>
          );
        })}
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-crisis-banner">
          <div className="crisis-label">⚠️ Active Crisis</div>
          <div className="crisis-date">West Asia Conflict — Mar 2026</div>
        </div>
      </div>
    </aside>
  );
}
