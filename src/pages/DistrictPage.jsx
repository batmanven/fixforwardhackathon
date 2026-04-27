import { Loader2 } from 'lucide-react';
import { generateDistrictReports, generateMorningReport } from '../data/alertData';
import { getLiveMSMEs } from '../data/msmeData';
import { formatNumber } from '../utils/formatters';
import { useEffect, useMemo, useState } from 'react';
import { motion } from 'framer-motion';

export default function DistrictPage() {
  const [selectedDistrict, setSelectedDistrict] = useState(null);
  const [liveMSMEs, setLiveMSMEs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLive() {
      try {
        const data = await getLiveMSMEs();
        setLiveMSMEs(data);
      } catch (err) {
        console.error('Failed to fetch live district data:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLive();
  }, []);

  const morningReports = useMemo(() => {
    const reports = generateDistrictReports(liveMSMEs);
    return reports.map(r => ({
      ...r,
      report: generateMorningReport(r),
    }));
  }, [liveMSMEs]);

  const selected = selectedDistrict
    ? morningReports.find(r => r.cluster === selectedDistrict)
    : morningReports[0];

  return (
    <div className="page-container">
      <div className="page-header">
        <h2>🏛️ District Official Dashboard</h2>
        <p>Daily shutdown prediction reports for District Industries Centre officials. Auto-generated at 6:00 AM.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 420px', gap: '24px' }}>
        {/* District Table */}
        <div>
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>📊 Cluster-wise Risk Summary</h3>
              <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>
                11 March 2026 • 06:00 AM
              </span>
            </div>
            <div className="glass-card-body" style={{ padding: 0 }}>
              {loading ? (
                <div style={{ padding: '60px', textAlign: 'center' }}>
                  <Loader2 className="animate-spin" style={{ margin: '0 auto 16px', color: 'var(--primary)' }} />
                  <p style={{ color: 'var(--text-secondary)' }}>Aggregating District Data...</p>
                </div>
              ) : (
                <table className="district-table">
                  <thead>
                    <tr>
                      <th>Cluster</th>
                      <th>State</th>
                      <th>Risk Breakdown</th>
                      <th>Workers</th>
                      <th>Avg Capacity</th>
                      <th>Export Risk</th>
                    </tr>
                  </thead>
                  <tbody>
                    {morningReports.map((r, i) => (
                      <motion.tr
                        key={r.cluster}
                        onClick={() => setSelectedDistrict(r.cluster)}
                        style={{
                          cursor: 'pointer',
                          background: selectedDistrict === r.cluster ? 'var(--surface)' : undefined,
                        }}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: i * 0.05 }}
                      >
                        <td>
                          <div style={{ fontWeight: 600 }}>📍 {r.cluster}</div>
                          <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>
                            {r.total} units
                          </div>
                        </td>
                        <td style={{ color: 'var(--text-secondary)' }}>{r.state}</td>
                        <td>
                          <div className="risk-dots">
                            <div className="risk-dot red">{r.red}</div>
                            <div className="risk-dot yellow">{r.yellow}</div>
                            <div className="risk-dot green">{r.green}</div>
                          </div>
                        </td>
                        <td style={{ fontWeight: 600 }}>
                          {formatNumber(r.totalEmployees)}
                        </td>
                        <td>
                          <div className="capacity-bar">
                            <div className="capacity-bar-track">
                              <div
                                className="capacity-bar-fill"
                                style={{
                                  width: `${r.avgCapacity}%`,
                                  background: r.avgCapacity < 35 ? 'var(--risk-red)' : r.avgCapacity < 50 ? 'var(--risk-yellow)' : 'var(--risk-green)',
                                }}
                              />
                            </div>
                            <span className="capacity-bar-label" style={{
                              color: r.avgCapacity < 35 ? 'var(--risk-red)' : r.avgCapacity < 50 ? 'var(--risk-yellow)' : 'var(--risk-green)',
                            }}>
                              {r.avgCapacity}%
                            </span>
                          </div>
                        </td>
                        <td>
                          {r.exportAtRisk > 0 ? (
                            <span style={{ color: 'var(--risk-red)', fontWeight: 600 }}>
                              ₹{formatNumber(r.exportAtRisk)}L
                            </span>
                          ) : (
                            <span style={{ color: 'var(--text-tertiary)' }}>—</span>
                          )}
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>

          {/* Industry Breakdown */}
          {selected && (
            <div className="glass-card" style={{ marginTop: '24px' }}>
              <div className="glass-card-header">
                <h3>🏭 Industry Breakdown — {selected.cluster}</h3>
              </div>
              <div className="glass-card-body">
                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  {selected.industries.map((ind, i) => (
                    <div key={i} style={{
                      padding: '12px 20px',
                      background: 'var(--surface)',
                      borderRadius: '8px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                    }}>
                      <span style={{ fontSize: '24px', fontWeight: 800, color: 'var(--primary)', fontFamily: 'var(--font-heading)' }}>
                        {ind.count}
                      </span>
                      <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{ind.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Action Items */}
          <div className="glass-card" style={{ marginTop: '24px' }}>
            <div className="glass-card-header">
              <h3>⚡ Priority Interventions</h3>
            </div>
            <div className="glass-card-body">
              {[
                { priority: '🔴 P0', action: 'Deploy emergency LPG allocation to Morbi — 12 ceramic units face shutdown within 48 hours', status: 'Pending' },
                { priority: '🔴 P0', action: 'Coordinate with BPCL for emergency Delhi-NCR restaurant cluster refill', status: 'In Progress' },
                { priority: '🟡 P1', action: 'Request HPCL to divert Kandla port LPG shipment to Morbi dealers', status: 'Pending' },
                { priority: '🟡 P1', action: 'Alert Bhiwandi DIC: 8 textile units have <3 days natural gas', status: 'Sent' },
                { priority: '🟢 P2', action: 'Schedule weekly fuel assessment for Ludhiana auto parts cluster', status: 'Planned' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  padding: '12px',
                  borderBottom: '1px solid var(--border)',
                }}>
                  <span style={{ fontSize: '14px', fontWeight: 600, width: '50px' }}>{item.priority}</span>
                  <span style={{ flex: 1, fontSize: '14px', color: 'var(--text-secondary)' }}>{item.action}</span>
                  <span style={{
                    fontSize: '11px',
                    padding: '4px 10px',
                    borderRadius: '12px',
                    background: item.status === 'Sent' ? 'var(--risk-green-bg)' : item.status === 'In Progress' ? 'var(--risk-yellow-bg)' : 'var(--surface)',
                    color: item.status === 'Sent' ? 'var(--risk-green)' : item.status === 'In Progress' ? 'var(--risk-yellow)' : 'var(--text-tertiary)',
                    fontWeight: 600,
                  }}>
                    {item.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* WhatsApp Preview */}
        <div>
          <div style={{ position: 'sticky', top: '80px' }}>
            <div style={{ marginBottom: '16px', fontSize: '13px', color: 'var(--text-tertiary)' }}>
              📱 WhatsApp Morning Report Preview
            </div>
            {selected && (
              <motion.div
                key={selected.cluster}
                className="whatsapp-report"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="whatsapp-header">
                  <div className="wa-avatar">⚡</div>
                  <div>
                    <div className="wa-name">MERP Alert Bot</div>
                    <div className="wa-status">Verified Government Service</div>
                  </div>
                </div>
                <div className="whatsapp-body">
                  <div className="whatsapp-message">
                    {selected.report}
                    <div className="wa-time">6:00 AM ✓✓</div>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="glass-card" style={{ marginTop: '16px' }}>
              <div className="glass-card-body" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                <div style={{ fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>
                  📋 Report Distribution
                </div>
                <ul style={{ paddingLeft: '16px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <li>District Industries Centre (DIC) — every morning at 6 AM</li>
                  <li>State MSME Commissioner — daily summary at 9 AM</li>
                  <li>Oil Marketing Company regional heads — real-time critical alerts</li>
                  <li>MSME Ministry dashboard — aggregated national view</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
