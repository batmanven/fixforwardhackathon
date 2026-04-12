import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, LineChart, Line
} from 'recharts';

function AnimatedCounter({ end, duration = 2000, prefix = '', suffix = '' }) {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTime = null;
    const startValue = 0;

    function animate(timestamp) {
      if (!startTime) startTime = timestamp;
      const progress = Math.min((timestamp - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
      setCount(Math.floor(eased * end));
      if (progress < 1) requestAnimationFrame(animate);
    }

    requestAnimationFrame(animate);
  }, [end, duration]);

  return <>{prefix}{count.toLocaleString('en-IN')}{suffix}</>;
}

const monthlyProjection = [
  { month: 'Month 1', msmes: 500, jobs: 25000, revenue: 37 },
  { month: 'Month 2', msmes: 1200, jobs: 60000, revenue: 90 },
  { month: 'Month 3', msmes: 2500, jobs: 125000, revenue: 187 },
  { month: 'Month 6', msmes: 7000, jobs: 350000, revenue: 525 },
  { month: 'Month 9', msmes: 50000, jobs: 2500000, revenue: 3750 },
  { month: 'Month 12', msmes: 128000, jobs: 6400000, revenue: 9600 },
];

const costBenefit = [
  { item: 'IVR Infrastructure', cost: 3 },
  { item: 'SMS Gateway', cost: 2 },
  { item: 'API Integration', cost: 4 },
  { item: 'Development', cost: 5 },
  { item: 'Operations (Year 1)', cost: 8 },
];

export default function ImpactPage() {
  return (
    <div className="page-container">
      <div className="page-header">
        <h2>📈 Impact Dashboard</h2>
        <p>Projected impact of MERP at scale — from 7,000 MSMEs in Year 1 to 12.8 million nationwide.</p>
      </div>

      {/* Hero Impact Counters */}
      <div className="impact-grid" style={{ marginBottom: '48px' }}>
        {[
          {
            icon: '👷',
            value: 350000,
            prefix: '',
            suffix: '',
            label: 'Jobs Protected (Year 1)',
            detail: 'Across ceramics, textiles, auto parts, and restaurants in 7 clusters',
            color: '#22C55E',
          },
          {
            icon: '💰',
            value: 525,
            prefix: '₹',
            suffix: ' Cr',
            label: 'Revenue Preserved (Year 1)',
            detail: 'Preventing 15 shutdown days per unit across 7,000 MSMEs',
            color: '#FF6B2B',
          },
          {
            icon: '🏭',
            value: 7000,
            prefix: '',
            suffix: '',
            label: 'MSMEs Protected (Year 1)',
            detail: 'Registered, mapped, and receiving real-time fuel intelligence',
            color: '#3B82F6',
          },
        ].map((item, i) => (
          <motion.div
            key={i}
            className="impact-card"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.15 }}
          >
            <div className="impact-icon">{item.icon}</div>
            <div className="impact-value" style={{ color: item.color }}>
              <AnimatedCounter end={item.value} prefix={item.prefix} suffix={item.suffix} />
            </div>
            <div className="impact-label">{item.label}</div>
            <div className="impact-detail">{item.detail}</div>
          </motion.div>
        ))}
      </div>

      {/* Full Scale Impact */}
      <div className="glass-card" style={{ marginBottom: '24px' }}>
        <div className="glass-card-body" style={{
          background: 'linear-gradient(135deg, rgba(255, 107, 43, 0.05), rgba(255, 107, 43, 0.01))',
          textAlign: 'center',
          padding: '48px',
        }}>
          <div style={{ fontSize: '12px', textTransform: 'uppercase', letterSpacing: '2px', color: 'var(--primary)', fontWeight: 700, marginBottom: '16px' }}>
            At Full Scale — 12.8 Million MSMEs
          </div>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '48px', flexWrap: 'wrap' }}>
            {[
              { value: '110M', label: 'Workers Protected', color: '#22C55E' },
              { value: '₹4.2L Cr', label: 'Exports Saved', color: '#FF6B2B' },
              { value: '30%', label: 'Medicine Surge Prevented', color: '#3B82F6' },
              { value: '66%', label: 'Emission Reduction per Reroute', color: '#A855F7' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.5 + i * 0.1 }}
              >
                <div style={{ fontFamily: 'var(--font-heading)', fontSize: '36px', fontWeight: 900, color: item.color }}>
                  {item.value}
                </div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '4px' }}>{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Growth Projection */}
      <div className="dashboard-grid" style={{ marginBottom: '24px' }}>
        <div className="col-8">
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>📊 MSME Adoption Projection (12 Months)</h3>
            </div>
            <div className="chart-container" style={{ height: '320px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyProjection}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="month" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={{ stroke: 'rgba(255,255,255,0.1)' }} />
                  <Tooltip
                    contentStyle={{
                      background: '#151C2C',
                      border: '1px solid rgba(255,255,255,0.1)',
                      borderRadius: '8px',
                      color: '#F1F5F9',
                    }}
                    formatter={(val, name) => {
                      if (name === 'msmes') return [val.toLocaleString(), 'MSMEs Registered'];
                      if (name === 'jobs') return [val.toLocaleString(), 'Jobs Protected'];
                      return [val, name];
                    }}
                  />
                  <Line type="monotone" dataKey="msmes" stroke="#FF6B2B" strokeWidth={3} dot={{ fill: '#FF6B2B', r: 5 }} name="msmes" />
                  <Line type="monotone" dataKey="jobs" stroke="#22C55E" strokeWidth={2} strokeDasharray="5 5" dot={false} name="jobs" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="col-4">
          <div className="glass-card" style={{ height: '100%' }}>
            <div className="glass-card-header">
              <h3>💵 Cost Structure</h3>
            </div>
            <div className="glass-card-body">
              <div style={{ marginBottom: '20px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>Total Investment</span>
                  <span style={{ fontSize: '24px', fontWeight: 800, fontFamily: 'var(--font-heading)', color: 'var(--primary)' }}>₹15L</span>
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                  Funded through Oil Company CSR budgets
                </div>
              </div>

              {costBenefit.map((item, i) => (
                <div key={i} style={{ marginBottom: '12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '13px', marginBottom: '4px' }}>
                    <span style={{ color: 'var(--text-secondary)' }}>{item.item}</span>
                    <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>₹{item.cost}L</span>
                  </div>
                  <div className="progress-bar">
                    <div className="progress-fill" style={{ width: `${(item.cost / 8) * 100}%`, background: 'var(--primary)' }} />
                  </div>
                </div>
              ))}

              <div style={{
                marginTop: '20px',
                padding: '16px',
                background: 'rgba(34, 197, 94, 0.05)',
                border: '1px solid rgba(34, 197, 94, 0.15)',
                borderRadius: '8px',
                textAlign: 'center',
              }}>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>ROI Multiplier</div>
                <div style={{ fontSize: '32px', fontWeight: 900, color: 'var(--risk-green)', fontFamily: 'var(--font-heading)' }}>
                  35,000x
                </div>
                <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>₹15L → ₹525 Cr protected</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Key Outcomes Table */}
      <div className="glass-card">
        <div className="glass-card-header">
          <h3>🎯 Stakeholder Impact Matrix</h3>
        </div>
        <div className="glass-card-body" style={{ padding: 0 }}>
          <table className="data-table">
            <thead>
              <tr>
                <th>Stakeholder</th>
                <th>Current State</th>
                <th>With MERP</th>
                <th>Impact</th>
              </tr>
            </thead>
            <tbody>
              {[
                {
                  who: '🏭 MSME Owner',
                  current: 'Blind to fuel availability; shuts down without warning',
                  after: 'SMS alert 48hrs before shutdown; QR code for emergency fuel',
                  impact: 'Business stays open',
                },
                {
                  who: '🏛️ District Official',
                  current: 'Learns of closures after they happen; reactive crisis management',
                  after: 'Daily WhatsApp report: which factories shut tomorrow',
                  impact: 'Predictive intervention',
                },
                {
                  who: '⛽ Oil Company',
                  current: 'Black market markups up to 300%; no visibility into MSME demand',
                  after: 'Real-time demand data; QR voucher-based allocation',
                  impact: '57% black market reduction',
                },
                {
                  who: '👷 Worker',
                  current: '110M livelihoods at risk with no safety net',
                  after: 'Factory stays open; wages continue',
                  impact: 'Job security',
                },
                {
                  who: '🇮🇳 India',
                  current: '₹4.2L Cr exports threatened; 30% medicine price surge',
                  after: 'Data infrastructure for every future crisis',
                  impact: 'National resilience',
                },
              ].map((row, i) => (
                <tr key={i}>
                  <td style={{ fontWeight: 600, whiteSpace: 'nowrap' }}>{row.who}</td>
                  <td style={{ color: 'var(--risk-red)' }}>{row.current}</td>
                  <td style={{ color: 'var(--risk-green)' }}>{row.after}</td>
                  <td style={{ fontWeight: 700, color: 'var(--primary)' }}>{row.impact}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Line */}
      <div style={{
        marginTop: '32px',
        padding: '48px',
        background: 'linear-gradient(135deg, rgba(255, 107, 43, 0.08), rgba(255, 107, 43, 0.02))',
        border: '1px solid rgba(255, 107, 43, 0.15)',
        borderRadius: '24px',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: '32px', marginBottom: '16px' }}>🔥</div>
        <h3 style={{ fontSize: '24px', marginBottom: '12px' }}>
          MERP: From ₹15 Lakhs to ₹4.2 Lakh Crores Protected
        </h3>
        <p style={{ color: 'var(--text-secondary)', fontSize: '16px', maxWidth: '600px', margin: '0 auto', lineHeight: 1.7 }}>
          Every MSME owner gets an SMS before shutdown. A QR code for fuel. A business that stays open.
          The government gets daily risk reports. India gets a data infrastructure for every future crisis.
        </p>
      </div>
    </div>
  );
}
