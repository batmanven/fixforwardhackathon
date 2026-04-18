import { useState, useMemo, useEffect } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { Bell, Filter, Send, AlertTriangle, Loader2 } from 'lucide-react';
import { generateAlerts } from '../data/alertData';
import { getLiveMSMEs } from '../data/msmeData';

export default function AlertsPage() {
  const [filter, setFilter] = useState('all');
  const [selectedAlert, setSelectedAlert] = useState(null);
  const [showSMS, setShowSMS] = useState(false);

  const [liveMSMEs, setLiveMSMEs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLive() {
      try {
        const data = await getLiveMSMEs();
        setLiveMSMEs(data);
      } catch (err) {
        console.error('Failed to fetch live alerts:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLive();
  }, []);

  const alerts = useMemo(() => generateAlerts(liveMSMEs), [liveMSMEs]);

  const filteredAlerts = useMemo(() => {
    if (filter === 'all') return alerts;
    return alerts.filter(a => a.alertType === filter);
  }, [filter, alerts]);

  const alertCounts = {
    CRITICAL: alerts.filter(a => a.alertType === 'CRITICAL').length,
    HIGH: alerts.filter(a => a.alertType === 'HIGH').length,
    WARNING: alerts.filter(a => a.alertType === 'WARNING').length,
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>🔔 Predictive Shutdown Alerts</h2>
            <p>Units with ≤5 days fuel remaining — sorted by urgency. Generated at 20:00 IST daily.</p>
          </div>
          <button className="btn btn-danger" onClick={() => setShowSMS(!showSMS)}>
            <Send size={16} />
            {showSMS ? 'Hide SMS View' : 'View SMS Alerts'}
          </button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="tabs">
        {[
          { key: 'all', label: `All (${alerts.length})` },
          { key: 'CRITICAL', label: `🔴 Critical (${alertCounts.CRITICAL})` },
          { key: 'HIGH', label: `🟡 High (${alertCounts.HIGH})` },
          { key: 'WARNING', label: `🟢 Warning (${alertCounts.WARNING})` },
        ].map(tab => (
          <button
            key={tab.key}
            className={`tab ${filter === tab.key ? 'active' : ''}`}
            onClick={() => setFilter(tab.key)}
          >
            {tab.label}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: showSMS ? '1fr 400px' : '1fr', gap: '24px' }}>
        {/* Alert List */}
        <div>
          {loading ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <Loader2 className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
              <p style={{ color: 'var(--text-secondary)' }}>Syncing with Predictive Engine...</p>
            </div>
          ) : filteredAlerts.length === 0 ? (
            <div className="glass-card" style={{ padding: '60px', textAlign: 'center' }}>
              <div style={{ fontSize: '40px', marginBottom: '16px' }}>🛡️</div>
              <h3>All Systems Stable</h3>
              <p style={{ color: 'var(--text-secondary)' }}>No units are currently below the critical fuel threshold.</p>
            </div>
          ) : filteredAlerts.map((alert, i) => (
            <motion.div
              key={alert.id}
              className={`alert-card ${alert.riskLevel}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: Math.min(i * 0.03, 0.5) }}
              onClick={() => setSelectedAlert(alert)}
              style={{ cursor: 'pointer', border: selectedAlert?.id === alert.id ? '1px solid var(--primary)' : undefined }}
            >
              <div className="alert-card-header">
                <div className="alert-card-info">
                  <h4>{alert.industryIcon} {alert.unitName}</h4>
                  <div className="alert-meta">
                    <span>📍 {alert.cluster}, {alert.state}</span>
                    <span>👤 {alert.ownerName}</span>
                    <span>🏭 {alert.industry}</span>
                  </div>
                </div>
                <span className={`risk-badge ${alert.riskLevel}`}>
                  <span className="badge-dot" />
                  {alert.alertType}
                </span>
              </div>

              <div className="alert-card-grid">
                <div className="alert-card-metric">
                  <span className="metric-label">Fuel Left</span>
                  <span className="metric-value" style={{ color: alert.riskLevel === 'red' ? 'var(--risk-red)' : 'var(--risk-yellow)' }}>
                    {alert.daysOfFuel} days
                  </span>
                </div>
                <div className="alert-card-metric">
                  <span className="metric-label">Risk Score</span>
                  <span className="metric-value">{alert.fuelScore}/100</span>
                </div>
                <div className="alert-card-metric">
                  <span className="metric-label">Workers</span>
                  <span className="metric-value">{alert.employees}</span>
                </div>
                <div className="alert-card-metric">
                  <span className="metric-label">Capacity</span>
                  <span className="metric-value">{alert.capacityUtilization}%</span>
                </div>
              </div>

              {alert.hasExportOrders && (
                <div style={{
                  marginTop: '12px',
                  padding: '6px 12px',
                  background: 'rgba(245, 158, 11, 0.1)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--risk-yellow)',
                }}>
                  📦 Export orders at risk: ₹{alert.exportValueLakhs}L
                </div>
              )}

              {alert.emergencyFuelRequested && (
                <div style={{
                  marginTop: '8px',
                  padding: '6px 12px',
                  background: 'rgba(255, 107, 43, 0.1)',
                  borderRadius: '6px',
                  fontSize: '12px',
                  color: 'var(--primary)',
                }}>
                  🆘 Emergency fuel requested — voucher pending
                </div>
              )}
            </motion.div>
          ))}
        </div>

        {/* SMS Panel */}
        {showSMS && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
          >
            <div className="glass-card" style={{ position: 'sticky', top: '80px' }}>
              <div className="glass-card-header">
                <h3>📱 SMS Alert Preview</h3>
              </div>
              <div className="glass-card-body">
                {selectedAlert ? (
                  <>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '8px' }}>
                      To: {selectedAlert.phone}
                    </div>
                    <div className="sms-preview" style={{ marginBottom: '16px' }}>
                      {selectedAlert.smsText}
                    </div>
                    <div style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>
                      Hindi / हिंदी:
                    </div>
                    <div className="sms-preview">
                      {selectedAlert.smsTextHindi}
                    </div>
                    <div style={{ marginTop: '16px', display: 'flex', gap: '8px' }}>
                      <button className="btn btn-primary btn-sm" style={{ flex: 1 }}>
                        <Send size={14} /> Send SMS
                      </button>
                      <button className="btn btn-secondary btn-sm">
                        📞 Call
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="empty-state" style={{ padding: '40px 20px' }}>
                    <div className="empty-icon">👆</div>
                    <h3>Select an Alert</h3>
                    <p style={{ color: 'var(--text-tertiary)', fontSize: '13px' }}>
                      Click on any alert card to preview the SMS that would be sent to the MSME owner.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
