import { useMemo } from 'react';
import { motion } from 'framer-motion';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { AlertTriangle, Factory, Users, TrendingDown, Fuel, Package } from 'lucide-react';
import { msmeList, stats } from '../data/msmeData';
import { dealerStats } from '../data/dealerData';
import { alerts } from '../data/alertData';
import { formatNumber } from '../utils/formatters';

const RISK_COLORS = { red: '#EF4444', yellow: '#F59E0B', green: '#22C55E' };

// 30-day simulated fuel availability trend
const fuelTrend = Array.from({ length: 30 }, (_, i) => {
  const day = i + 1;
  const base = 85 - (day * 1.8) + (Math.random() * 5 - 2.5);
  return {
    day: `Mar ${day}`,
    availability: Math.max(15, Math.min(90, base)),
    demand: 75 + Math.random() * 10,
  };
});

// Cluster capacity data
const clusterCapacity = [
  { cluster: 'Morbi', capacity: 32, industry: 'Ceramics' },
  { cluster: 'Bhiwandi', capacity: 38, industry: 'Textiles' },
  { cluster: 'Ludhiana', capacity: 42, industry: 'Auto Parts' },
  { cluster: 'Surat', capacity: 35, industry: 'Textiles' },
  { cluster: 'Pune', capacity: 45, industry: 'Mixed' },
  { cluster: 'Ahmedabad', capacity: 40, industry: 'Pharma' },
  { cluster: 'Delhi-NCR', capacity: 28, industry: 'Restaurants' },
];

const riskPieData = [
  { name: 'Critical', value: stats.redUnits, color: RISK_COLORS.red },
  { name: 'Warning', value: stats.yellowUnits, color: RISK_COLORS.yellow },
  { name: 'Stable', value: stats.greenUnits, color: RISK_COLORS.green },
];

export default function DashboardPage() {
  const criticalAlerts = useMemo(() => alerts.slice(0, 5), []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>⚡ Crisis Intelligence Dashboard</h2>
            <p>Real-time MSME fuel risk monitoring — Last updated: 11 March 2026, 20:00 IST</p>
          </div>
        </div>
      </div>

      {/* Stats Row */}
      <div className="stats-grid">
        <motion.div
          className="stat-card red"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0 }}
        >
          <div className="stat-card-icon"><AlertTriangle size={22} /></div>
          <div className="stat-card-label">Critical Units</div>
          <div className="stat-card-value">{stats.redUnits}</div>
          <div className="stat-card-desc">Shutdown imminent (≤3 days fuel)</div>
        </motion.div>

        <motion.div
          className="stat-card yellow"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="stat-card-icon"><Factory size={22} /></div>
          <div className="stat-card-label">Warning Units</div>
          <div className="stat-card-value">{stats.yellowUnits}</div>
          <div className="stat-card-desc">3-7 days fuel remaining</div>
        </motion.div>

        <motion.div
          className="stat-card green"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="stat-card-icon"><Users size={22} /></div>
          <div className="stat-card-label">Workers at Risk</div>
          <div className="stat-card-value">{formatNumber(stats.totalEmployees)}</div>
          <div className="stat-card-desc">Across {stats.totalMSMEs} registered units</div>
        </motion.div>

        <motion.div
          className="stat-card primary"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <div className="stat-card-icon"><TrendingDown size={22} /></div>
          <div className="stat-card-label">Avg. Capacity</div>
          <div className="stat-card-value">{stats.avgCapacity}%</div>
          <div className="stat-card-desc">Down from 82% three weeks ago</div>
        </motion.div>
      </div>

      {/* Charts Row */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        {/* Fuel Availability Trend */}
        <div className="col-8">
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>📉 Fuel Availability Trend (30 Days)</h3>
              <span className="risk-badge red">
                <span className="badge-dot" />
                Declining
              </span>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={fuelTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis
                    dataKey="day"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    interval={4}
                  />
                  <YAxis
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#151C2C',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="demand"
                    stroke="#64748B"
                    fill="rgba(100, 116, 139, 0.1)"
                    strokeWidth={1}
                    strokeDasharray="4 4"
                    name="Demand Level"
                  />
                  <Area
                    type="monotone"
                    dataKey="availability"
                    stroke="#FF6B2B"
                    fill="url(#orangeGradient)"
                    strokeWidth={2}
                    name="Fuel Availability"
                  />
                  <defs>
                    <linearGradient id="orangeGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#FF6B2B" stopOpacity={0.3} />
                      <stop offset="100%" stopColor="#FF6B2B" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Risk Distribution */}
        <div className="col-4">
          <div className="glass-card" style={{ height: '100%' }}>
            <div className="glass-card-header">
              <h3>🎯 Risk Distribution</h3>
            </div>
            <div className="chart-container" style={{ height: '200px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={riskPieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={80}
                    dataKey="value"
                    strokeWidth={0}
                  >
                    {riskPieData.map((entry, i) => (
                      <Cell key={i} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      background: '#151C2C',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div style={{ padding: '0 24px 24px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {riskPieData.map(item => (
                <div key={item.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                    <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: item.color }} />
                    {item.name}
                  </div>
                  <span style={{ fontWeight: 700, fontSize: '14px', color: item.color }}>{item.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Cluster Capacity + Critical Alerts */}
      <div className="dashboard-grid">
        {/* Cluster Capacity */}
        <div className="col-6">
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>🏭 Cluster Capacity Utilization</h3>
            </div>
            <div className="chart-container" style={{ height: '300px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={clusterCapacity} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" horizontal={false} />
                  <XAxis
                    type="number"
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    domain={[0, 100]}
                    unit="%"
                  />
                  <YAxis
                    type="category"
                    dataKey="cluster"
                    tick={{ fill: '#94A3B8', fontSize: 12 }}
                    axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                    width={80}
                  />
                  <Tooltip
                    contentStyle={{
                      background: '#151C2C',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                    }}
                    formatter={(val) => [`${val}%`, 'Capacity']}
                  />
                  <Bar dataKey="capacity" radius={[0, 4, 4, 0]}>
                    {clusterCapacity.map((entry, i) => (
                      <Cell
                        key={i}
                        fill={entry.capacity < 35 ? RISK_COLORS.red : entry.capacity < 45 ? RISK_COLORS.yellow : RISK_COLORS.green}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* Critical Alerts Feed */}
        <div className="col-6">
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>🚨 Latest Shutdown Predictions</h3>
              <span className="risk-badge red">
                <span className="badge-dot" />
                {stats.criticalUnits} Critical
              </span>
            </div>
            <div className="glass-card-body" style={{ maxHeight: '340px', overflowY: 'auto' }}>
              {criticalAlerts.map((alert, i) => (
                <motion.div
                  key={alert.id}
                  className={`alert-card ${alert.riskLevel}`}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.1 }}
                  style={{ padding: '16px', marginBottom: '8px' }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: '14px' }}>
                        {alert.industryIcon} {alert.unitName}
                      </div>
                      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {alert.cluster}, {alert.state} • {alert.employees} workers
                      </div>
                    </div>
                    <span className={`risk-badge ${alert.riskLevel}`} style={{ fontSize: '11px' }}>
                      {alert.daysOfFuel}d fuel
                    </span>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Dealer Supply Status */}
      <div style={{ marginTop: '24px' }}>
        <div className="glass-card">
          <div className="glass-card-header">
            <h3>⛽ OMC Dealer Network Status</h3>
            <div style={{ display: 'flex', gap: '16px', fontSize: '13px' }}>
              <span style={{ color: 'var(--risk-red)' }}>● {dealerStats.empty + dealerStats.critical} Critical</span>
              <span style={{ color: 'var(--risk-yellow)' }}>● {dealerStats.low} Low</span>
              <span style={{ color: 'var(--risk-green)' }}>● {dealerStats.available} Available</span>
            </div>
          </div>
          <div className="glass-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '24px' }}>
              {[
                { label: 'Total Dealers', value: dealerStats.total, icon: <Fuel size={18} /> },
                { label: 'Avg Wait Days', value: `${dealerStats.avgWaitDays}d`, icon: <Package size={18} />, color: 'var(--risk-yellow)' },
                { label: 'Avg Stock Level', value: `${dealerStats.avgStockPct}%`, icon: <TrendingDown size={18} />, color: 'var(--risk-red)' },
                { label: 'Accepting QR Vouchers', value: dealerStats.acceptingVouchers, icon: <Factory size={18} />, color: 'var(--risk-green)' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ color: item.color || 'var(--text-tertiary)', marginBottom: '8px' }}>{item.icon}</div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontSize: '28px', fontWeight: 800, color: item.color || 'var(--text-primary)' }}>
                    {item.value}
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px' }}>{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
