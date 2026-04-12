import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Sidebar from './components/layout/Sidebar';
import TopBar from './components/layout/TopBar';
import LandingPage from './pages/LandingPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import MapPage from './pages/MapPage';
import AlertsPage from './pages/AlertsPage';
import ReroutingPage from './pages/ReroutingPage';
import DistrictPage from './pages/DistrictPage';
import ImpactPage from './pages/ImpactPage';
import { useState } from 'react';

function AppLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="app-layout">
      <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className={`sidebar-overlay ${sidebarOpen ? 'visible' : ''}`} onClick={() => setSidebarOpen(false)} />
      <TopBar />
      <main className="main-content">
        {children}
      </main>
      <button className="mobile-nav-toggle" onClick={() => setSidebarOpen(!sidebarOpen)}>
        {sidebarOpen ? '✕' : '☰'}
      </button>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/register" element={<AppLayout><RegisterPage /></AppLayout>} />
        <Route path="/dashboard" element={<AppLayout><DashboardPage /></AppLayout>} />
        <Route path="/map" element={<AppLayout><MapPage /></AppLayout>} />
        <Route path="/alerts" element={<AppLayout><AlertsPage /></AppLayout>} />
        <Route path="/rerouting" element={<AppLayout><ReroutingPage /></AppLayout>} />
        <Route path="/district" element={<AppLayout><DistrictPage /></AppLayout>} />
        <Route path="/impact" element={<AppLayout><ImpactPage /></AppLayout>} />
      </Routes>
    </Router>
  );
}

export default App;
