import { useState, useMemo } from 'react';
import { motion } from 'framer-motion';
import { QRCodeSVG } from 'qrcode.react';
import { MapPin, Fuel, Clock, CheckCircle, ArrowRight, Search } from 'lucide-react';
import { msmeList } from '../data/msmeData';
import { findNearbyDealers, generateVoucher } from '../utils/dealerMatcher';

export default function ReroutingPage() {
  const [selectedMSME, setSelectedMSME] = useState(null);
  const [nearbyDealers, setNearbyDealers] = useState([]);
  const [selectedDealer, setSelectedDealer] = useState(null);
  const [voucher, setVoucher] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [step, setStep] = useState(1); // 1: select MSME, 2: select dealer, 3: voucher

  const criticalMSMEs = useMemo(() =>
    msmeList
      .filter(m => m.riskLevel === 'red' || m.daysOfFuel <= 5)
      .sort((a, b) => a.daysOfFuel - b.daysOfFuel),
    []
  );

  const filteredMSMEs = useMemo(() => {
    if (!searchQuery) return criticalMSMEs.slice(0, 20);
    return criticalMSMEs.filter(m =>
      m.unitName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.ownerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      m.clusterName.toLowerCase().includes(searchQuery.toLowerCase())
    ).slice(0, 20);
  }, [searchQuery, criticalMSMEs]);

  function handleSelectMSME(msme) {
    setSelectedMSME(msme);
    const dealers = findNearbyDealers(msme.lat, msme.lng, 50, msme.fuelType);
    setNearbyDealers(dealers);
    setSelectedDealer(null);
    setVoucher(null);
    setStep(2);
  }

  function handleSelectDealer(dealer) {
    setSelectedDealer(dealer);
    const v = generateVoucher(selectedMSME, dealer);
    setVoucher(v);
    setStep(3);
  }

  function handleReset() {
    setSelectedMSME(null);
    setNearbyDealers([]);
    setSelectedDealer(null);
    setVoucher(null);
    setStep(1);
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>🔄 Emergency Fuel Rerouting</h2>
            <p>Scan nearby dealers, generate QR voucher, bypass black markets. 24-hour emergency allocation.</p>
          </div>
          {step > 1 && (
            <button className="btn btn-secondary" onClick={handleReset}>← Start Over</button>
          )}
        </div>
      </div>

      {/* Progress Steps */}
      <div className="voucher-status-bar" style={{ maxWidth: '600px', marginBottom: '32px' }}>
        {[
          { num: 1, label: 'Select MSME' },
          { num: 2, label: 'Find Dealer' },
          { num: 3, label: 'QR Voucher' },
        ].map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div className={`voucher-step ${step > s.num ? 'completed' : step === s.num ? 'active' : ''}`}>
                <div className="voucher-step-dot">
                  {step > s.num ? <CheckCircle size={16} /> : s.num}
                </div>
              </div>
              <div className="voucher-step-label">{s.label}</div>
            </div>
            {i < 2 && (
              <div style={{
                flex: 1,
                height: '2px',
                background: step > s.num ? 'var(--risk-green)' : 'var(--border)',
                margin: '0 8px',
                marginBottom: '20px',
              }} />
            )}
          </div>
        ))}
      </div>

      {/* Step 1: Select MSME */}
      {step === 1 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>🏭 Select MSME Unit Requesting Emergency Fuel</h3>
              <span className="risk-badge red">
                <span className="badge-dot" />
                {criticalMSMEs.length} Units Need Fuel
              </span>
            </div>
            <div className="glass-card-body">
              <div style={{ marginBottom: '16px', position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-tertiary)' }} />
                <input
                  type="text"
                  className="form-input"
                  placeholder="Search by name, ID, owner, or cluster..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  style={{ paddingLeft: '36px' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '500px', overflow: 'auto' }}>
                {filteredMSMEs.map((msme, i) => (
                  <motion.div
                    key={msme.id}
                    className={`alert-card ${msme.riskLevel}`}
                    style={{ cursor: 'pointer', flexShrink: 0 }}
                    onClick={() => handleSelectMSME(msme)}
                    whileHover={{ scale: 1.01 }}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.02 }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '14px' }}>
                          {msme.industryIcon} {msme.unitName}
                        </div>
                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                          {msme.ownerName} • {msme.clusterName} • {msme.employees} workers • {msme.fuelType}
                        </div>
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{
                          fontSize: '20px',
                          fontWeight: 800,
                          color: msme.riskLevel === 'red' ? 'var(--risk-red)' : 'var(--risk-yellow)',
                          fontFamily: 'var(--font-heading)',
                        }}>
                          {msme.daysOfFuel}d
                        </div>
                        <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>fuel left</div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 2: Find Dealer */}
      {step === 2 && selectedMSME && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Selected Unit Summary */}
          <div className="glass-card" style={{ marginBottom: '24px' }}>
            <div className="glass-card-body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '4px' }}>Requesting Unit</div>
                <div style={{ fontWeight: 700, fontSize: '18px' }}>{selectedMSME.industryIcon} {selectedMSME.unitName}</div>
                <div style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
                  {selectedMSME.ownerName} • {selectedMSME.clusterName} • Needs: {selectedMSME.fuelType}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '28px', fontWeight: 900, color: 'var(--risk-red)', fontFamily: 'var(--font-heading)' }}>
                  {selectedMSME.daysOfFuel}d
                </div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>fuel remaining</div>
              </div>
            </div>
          </div>

          {/* Dealer List */}
          <div className="glass-card">
            <div className="glass-card-header">
              <h3>⛽ Available Dealers Within 50km ({nearbyDealers.length} found)</h3>
            </div>
            <div className="glass-card-body">
              {nearbyDealers.length > 0 ? (
                <div className="dealer-list">
                  {nearbyDealers.map((dealer, i) => (
                    <motion.div
                      key={dealer.id}
                      className="dealer-card"
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.05 }}
                      onClick={() => handleSelectDealer(dealer)}
                      style={{ cursor: 'pointer' }}
                    >
                      <div className="dealer-card-info">
                        <div className={`dealer-card-logo ${dealer.company}`}>
                          {dealer.company.substring(0, 3)}
                        </div>
                        <div className="dealer-card-details">
                          <h4>{dealer.name}</h4>
                          <div className="dealer-meta">
                            <span><MapPin size={12} /> {dealer.distance}km</span>
                            <span><Clock size={12} /> {dealer.waitingDays}d wait</span>
                            <span>{dealer.acceptsVoucher ? '✅ QR' : '❌ QR'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="dealer-card-stock">
                        <div className="stock-bar">
                          <div
                            className="stock-fill"
                            style={{
                              width: `${dealer.stockPct}%`,
                              background: dealer.stockPct > 50 ? 'var(--risk-green)' : dealer.stockPct > 20 ? 'var(--risk-yellow)' : 'var(--risk-red)',
                            }}
                          />
                        </div>
                        <div className="stock-label">{dealer.stockPct}% stock • {dealer.lpgCylinders} LPG</div>
                        <button className="btn btn-primary btn-sm" style={{ marginTop: '8px' }}>
                          Select <ArrowRight size={14} />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="empty-state">
                  <div className="empty-icon">😔</div>
                  <h3>No Dealers With Stock</h3>
                  <p>No dealers within 50km have available {selectedMSME.fuelType} stock. Expanding search radius...</p>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      )}

      {/* Step 3: QR Voucher */}
      {step === 3 && voucher && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 400px', gap: '24px' }}>
            {/* Voucher Card */}
            <div>
              <div className="qr-voucher">
                <div className="qr-voucher-header">
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>⛽</div>
                  <h3>MERP Emergency Fuel Voucher</h3>
                  <p>Government of India — MSME Resilience Program</p>
                </div>

                <div className="qr-voucher-body">
                  <QRCodeSVG
                    value={voucher.qrData}
                    size={180}
                    level="H"
                    includeMargin={true}
                    bgColor="#ffffff"
                    fgColor="#0A0E17"
                  />

                  <div className="qr-voucher-info">
                    <dt>MSME Unit</dt>
                    <dd>{voucher.msmeName}</dd>
                    <dt>Owner</dt>
                    <dd>{voucher.ownerName}</dd>
                    <dt>Dealer</dt>
                    <dd>{voucher.dealerName}</dd>
                    <dt>OMC</dt>
                    <dd>{voucher.dealerCompany}</dd>
                    <dt>Fuel Type</dt>
                    <dd>{voucher.fuelType}</dd>
                    <dt>Allocation</dt>
                    <dd>{voucher.quantity}</dd>
                    <dt>Distance</dt>
                    <dd>{voucher.distance}km</dd>
                    <dt>Status</dt>
                    <dd style={{ color: '#22C55E' }}>✓ GENERATED</dd>
                  </div>
                </div>

                <div className="qr-voucher-footer">
                  <div className="expiry">⏰ Valid for 24 hours only</div>
                  <div className="voucher-id">{voucher.voucherId}</div>
                  <div style={{ fontSize: '11px', color: '#999', marginTop: '8px' }}>
                    Show this QR code at the assigned dealer for immediate fuel disbursement.
                    Dealer will be reimbursed within 48 hours.
                  </div>
                </div>
              </div>
            </div>

            {/* Status Panel */}
            <div>
              <div className="glass-card" style={{ marginBottom: '16px' }}>
                <div className="glass-card-header">
                  <h3>📋 Voucher Status</h3>
                </div>
                <div className="glass-card-body">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                    {[
                      { label: 'QR Generated', status: 'completed', icon: '✅', time: 'Just now' },
                      { label: 'SMS Sent to Owner', status: 'completed', icon: '✅', time: '< 1 min' },
                      { label: 'Dealer Notified', status: 'completed', icon: '✅', time: '< 1 min' },
                      { label: 'Owner Arrives at Dealer', status: 'pending', icon: '⏳', time: 'Pending' },
                      { label: 'Fuel Disbursed', status: 'pending', icon: '⏳', time: 'Pending' },
                      { label: 'Dealer Reimbursed', status: 'pending', icon: '⏳', time: '48hr after disburse' },
                    ].map((item, i) => (
                      <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                        <span>{item.icon}</span>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontSize: '14px', fontWeight: item.status === 'completed' ? 600 : 400, color: item.status === 'completed' ? 'var(--text-primary)' : 'var(--text-tertiary)' }}>
                            {item.label}
                          </div>
                        </div>
                        <span style={{ fontSize: '12px', color: 'var(--text-tertiary)' }}>{item.time}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div className="glass-card">
                <div className="glass-card-body" style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: '14px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                    This voucher bypasses black market pricing.
                  </div>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    gap: '24px',
                    padding: '16px',
                    background: 'var(--surface)',
                    borderRadius: '12px',
                  }}>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>Black Market</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--risk-red)', textDecoration: 'line-through' }}>₹4,500</div>
                    </div>
                    <div style={{ fontSize: '24px', color: 'var(--text-tertiary)', alignSelf: 'center' }}>→</div>
                    <div>
                      <div style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}>MERP Rate</div>
                      <div style={{ fontSize: '20px', fontWeight: 700, color: 'var(--risk-green)' }}>₹1,950</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '12px', color: 'var(--risk-green)', marginTop: '8px' }}>
                    Saving: ₹2,550 per cylinder (57%)
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
