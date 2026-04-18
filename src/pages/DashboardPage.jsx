import { useMemo, useState, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { AlertTriangle, Factory, Users, TrendingDown, Fuel, Package } from 'lucide-react';
import { calculateStats, getLiveMSMEs } from '../data/msmeData';
import { calculateDealerStats, getLiveDealers } from '../data/dealerData';
import { formatNumber } from '../utils/formatters';

const RISK_COLORS = { red: '#EF4444', yellow: '#F59E0B', green: '#22C55E' };

export default function DashboardPage() {
  const [msmeList, setMsmeList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [msmes, dealers] = await Promise.all([
        getLiveMSMEs(),
        getLiveDealers()
      ]);
      setMsmeList(msmes);
      setDealerList(dealers);
      setLoading(false);
    };
    loadData();
  }, []);

  const stats = useMemo(() => calculateStats(msmeList), [msmeList]);
  const dealerInfo = useMemo(() => calculateDealerStats(dealerList), [dealerList]);
  const criticalAlerts = useMemo(() => msmeList.filter(m => m.riskLevel === 'red').slice(0, 5), [msmeList]);

  // Cluster capacity data
  const clusterCapacity = useMemo(() => [
    { cluster: 'Morbi', capacity: 32, industry: 'Ceramics' },
    { cluster: 'Bhiwandi', capacity: 38, industry: 'Textiles' },
    { cluster: 'Ludhiana', capacity: 42, industry: 'Auto Parts' },
    { cluster: 'Surat', capacity: 35, industry: 'Textiles' },
    { cluster: 'Pune', capacity: 45, industry: 'Mixed' },
    { cluster: 'Ahmedabad', capacity: 40, industry: 'Pharma' },
    { cluster: 'Delhi-NCR', capacity: 28, industry: 'Restaurants' },
  ], []);

  const riskPieData = useMemo(() => [
    { name: 'Critical', value: stats.redUnits, color: RISK_COLORS.red },
    { name: 'Warning', value: stats.yellowUnits, color: RISK_COLORS.yellow },
    { name: 'Stable', value: stats.greenUnits, color: RISK_COLORS.green },
  ], [stats]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Connecting to MERP Intelligence Layer...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>⚡ Crisis Intelligence Dashboard</h2>
            <p>Real-time MSME fuel risk monitoring — Live Environment</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <motion.div className="stat-card red" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="stat-card-icon"><AlertTriangle size={22} /></div>
          <div className="stat-card-label">Critical Units</div>
          <div className="stat-card-value">{stats.redUnits}</div>
          <div className="stat-card-desc">Shutdown imminent (≤3 days fuel)</div>
        </motion.div>

        <motion.div className="stat-card yellow" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="stat-card-icon"><Factory size={22} /></div>
          <div className="stat-card-label">Warning Units</div>
          <div className="stat-card-value">{stats.yellowUnits}</div>
          <div className="stat-card-desc">3-7 days fuel remaining</div>
        </motion.div>

        <motion.div className="stat-card green" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <div className="stat-card-icon"><Users size={22} /></div>
          <div className="stat-card-label">Workers at Risk</div>
          <div className="stat-card-value">{formatNumber(stats.totalEmployees)}</div>
          <div className="stat-card-desc">Across {stats.totalMSMEs} registered units</div>
        </motion.div>

        <motion.div className="stat-card primary" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
          <div className="stat-card-icon"><TrendingDown size={22} /></div>
          <div className="stat-card-label">Avg. Capacity</div>
          <div className="stat-card-value">{stats.avgCapacity}%</div>
          <div className="stat-card-desc">Live cluster average</div>
        </motion.div>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="col-8">
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>📉 Fuel Availability Trend (Simulated)</h3>
              <span className="risk-badge red"><span className="badge-dot" />Declining</span>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={Array.from({ length: 30 }, (_, i) => ({ day: `Mar ${i + 1}`, availability: 80 - i * 2, demand: 70 }))}>
                  <XAxis dataKey="day" tick={{ fill: '#64748B', fontSize: 11 }} />
                  <YAxis unit="%" />
                  <Tooltip />
                  <Area type="monotone" dataKey="availability" stroke="#FF6B2B" fill="rgba(255, 107, 43, 0.2)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="glass-card" style={{ height: '100%' }}>
            <div className="glass-card-header">
              <h3>🎯 Risk Distribution</h3>
            </div>
            <div className="chart-container" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskPieData} dataKey="value" innerRadius={55} outerRadius={80} strokeWidth={0}>
                    {riskPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      </div>

      <div className="dashboard-grid">
        <div className="col-6">
          <div className="glass-card">
            <div className="glass-card-header"><h3>🏭 Cluster Capacity</h3></div>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterCapacity} layout="vertical">
                  <XAxis type="number" hide />
                  <YAxis type="category" dataKey="cluster" width={80} />
                  <Tooltip />
                  <Bar dataKey="capacity" radius={[0, 4, 4, 0]}>
                    {clusterCapacity.map((item, i) => <Cell key={i} fill={item.capacity < 40 ? RISK_COLORS.red : RISK_COLORS.green} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-6">
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>🚨 Latest Predictions</h3>
              <span className="risk-badge red">{stats.redUnits} Critical</span>
            </div>
            <div className="glass-card-body" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {criticalAlerts.map((alert, i) => (
                <div key={i} className={`alert-card red`} style={{ padding: '16px', marginBottom: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{alert.industryIcon} {alert.unitName}</div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{alert.clusterName} • {alert.employees} jobs</div>
                    </div>
                    <span className="risk-badge red">{Number(alert.daysOfFuel).toFixed(1)}d left</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '24px' }}>
        <div className="glass-card">
          <div className="glass-card-header">
            <h3>⛽ OMC Dealer Network Status</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <span style={{ color: 'var(--risk-red)' }}>● {dealerInfo.empty + dealerInfo.critical} Critical</span>
              <span style={{ color: 'var(--risk-green)' }}>● {dealerInfo.available} Active</span>
            </div>
          </div>
          <div className="glass-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px', textAlign: 'center' }}>
              <div><div style={{ fontSize: '28px', fontWeight: 800 }}>{dealerInfo.total}</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Total Dealers</div></div>
              <div><div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--risk-yellow)' }}>{dealerInfo.avgWaitDays}d</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Avg Wait</div></div>
              <div><div style={{ fontSize: '28px', fontWeight: 800 }}>{dealerInfo.avgStockPct}%</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Avg Stock</div></div>
              <div><div style={{ fontSize: '28px', fontWeight: 800, color: 'var(--risk-green)' }}>{dealerInfo.acceptingVouchers}</div><div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>Accepting QR</div></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
