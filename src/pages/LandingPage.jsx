import { useNavigate } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion } from 'framer-motion';
import { ArrowRight, Fuel, Shield, BarChart3, MapPin, Bell, QrCode } from 'lucide-react';

const fadeIn = {
  hidden: { opacity: 0, y: 30 },
  visible: (i) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.15, duration: 0.6, ease: 'easeOut' },
  }),
};

const counterVariant = {
  hidden: { opacity: 0, scale: 0.5 },
  visible: { opacity: 1, scale: 1, transition: { duration: 0.8, ease: 'easeOut' } },
};

export default function LandingPage() {
  const navigate = useNavigate();

  const crisisCards = [
    {
      icon: '⛽',
      title: 'Fuel Rationing',
      stat: '25 Days',
      desc: 'LPG cylinder waiting period in Gujarat, Maharashtra, Delhi-NCR — up from 48 hours.',
      source: 'Times of India, March 10',
    },
    {
      icon: '🏪',
      title: 'Business Closures',
      stat: '15,000+',
      desc: 'Restaurants and eateries in Pune, Surat, Ahmedabad temporarily shut down.',
      source: 'Hotel & Restaurant Association',
    },
    {
      icon: '🚢',
      title: 'Export Standstill',
      stat: '₹450 Cr',
      desc: '60,000 tonnes basmati rice stranded at Kandla and Mundra ports.',
      source: 'APEDA',
    },
    {
      icon: '💊',
      title: 'Medicine Price Shock',
      stat: '+30%',
      desc: 'Essential medicine prices projected to surge within 60 days as API manufacturing stalls.',
      source: 'Pharmexcil',
    },
  ];

  const steps = [
    {
      num: 1,
      title: 'Registration via Missed Call',
      desc: 'MSME owner dials toll-free number. IVR in 8 languages captures: industry, daily fuel usage, stock, exports, employees. A Fuel Dependency Score (1-100) is generated instantly.',
      icon: '📞',
    },
    {
      num: 2,
      title: 'Supply Chain Integration',
      desc: 'MERP connects to IndianOil, BPCL, HPCL dealer systems. Live fuel availability at every dealer is pulled and overlaid with crisis news alerts by pin code.',
      icon: '🔗',
    },
    {
      num: 3,
      title: 'Predictive Shutdown Alerts',
      desc: 'Every night at 8 PM, MERP calculates days of fuel remaining. Red units get SMS alerts. District officials get WhatsApp morning reports with exactly which factories will shut tomorrow.',
      icon: '🔔',
    },
    {
      num: 4,
      title: 'Dynamic Fuel Rerouting',
      desc: 'Emergency fuel request → MERP scans 50km radius for stock → QR code voucher generated (24hr valid) → Owner shows at dealer → Instant refill. Bypasses black markets.',
      icon: '🔄',
    },
    {
      num: 5,
      title: 'Zero-Infrastructure Design',
      desc: 'No smartphone? Missed call + SMS. No internet? Works on 2G. Can\'t read? Voice prompts in 8 languages. Cost to MSME? Zero. Funded by oil company CSR.',
      icon: '📱',
    },
  ];

  return (
    <div className="landing-page">
      {/* Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-logo">
          <div className="nav-logo-icon">
            <Fuel size={18} color="white" />
          </div>
          <span>MERP</span>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => navigate('/dashboard')}>
          Enter Dashboard <ArrowRight size={16} />
        </button>
      </nav>

      {/* Hero */}
      <section className="landing-hero">
        <motion.div
          className="hero-content"
          initial="hidden"
          animate="visible"
        >
          <motion.div className="hero-badge" custom={0} variants={fadeIn}>
            <span className="pulse-dot" />
            ACTIVE CRISIS — WEST ASIA CONFLICT, MARCH 2026
          </motion.div>

          <motion.h1 className="hero-title" custom={1} variants={fadeIn}>
            India's MSMEs are going <span className="highlight">dark.</span>
            <br />
            MERP turns the lights back on.
          </motion.h1>

          <motion.p className="hero-subtitle" custom={2} variants={fadeIn}>
            India's first real-time fuel intelligence system for 12.8 million MSMEs.
            Predictive shutdown alerts. Dynamic fuel rerouting. Works on a feature phone.
            Built for the ceramic worker in Morbi who has 2 days of LPG left.
          </motion.p>

          <motion.div className="hero-stats" custom={3} variants={fadeIn}>
            <div className="hero-stat">
              <motion.div className="hero-stat-value" variants={counterVariant}>12.8M</motion.div>
              <div className="hero-stat-label">MSMEs at Risk</div>
            </div>
            <div className="hero-stat">
              <motion.div className="hero-stat-value" variants={counterVariant}>110M</motion.div>
              <div className="hero-stat-label">Workers Affected</div>
            </div>
            <div className="hero-stat">
              <motion.div className="hero-stat-value" variants={counterVariant}>₹4.2L Cr</motion.div>
              <div className="hero-stat-label">Exports Threatened</div>
            </div>
            <div className="hero-stat">
              <motion.div className="hero-stat-value" variants={counterVariant}>0</motion.div>
              <div className="hero-stat-label">Early Warning Systems</div>
            </div>
          </motion.div>

          <motion.div className="hero-cta" custom={4} variants={fadeIn}>
            <button className="btn btn-primary btn-lg" onClick={() => navigate('/dashboard')}>
              Enter MERP Dashboard <ArrowRight size={20} />
            </button>
            <button className="btn btn-secondary btn-lg" onClick={() => navigate('/register')}>
              Try IVR Simulator
            </button>
          </motion.div>
        </motion.div>
      </section>

      {/* Crisis Section */}
      <section className="landing-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-label">Ground Reality — March 2026</div>
          <h2 className="section-title">The Crisis is Now</h2>
          <div style={{ marginBottom: '16px' }}>
            <blockquote style={{
              borderLeft: '3px solid var(--risk-red)',
              padding: '16px 24px',
              background: 'var(--surface)',
              borderRadius: '0 8px 8px 0',
              fontStyle: 'italic',
              color: 'var(--text-secondary)',
              marginBottom: '32px',
            }}>
              "India faces serious supply chain disruptions and a climate of instability. Fake source-based assurances have failed MSMEs."
              <br />
              <strong style={{ color: 'var(--text-primary)', fontStyle: 'normal', fontSize: '13px' }}>
                — Dr. S. Jaishankar, External Affairs Minister, Parliament Statement, March 9, 2026
              </strong>
            </blockquote>
          </div>
        </motion.div>

        <div className="crisis-timeline">
          {crisisCards.map((card, i) => (
            <motion.div
              key={i}
              className="crisis-card"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="crisis-icon">{card.icon}</div>
              <h4>{card.title}</h4>
              <p>{card.desc}</p>
              <div className="crisis-stat">{card.stat}</div>
              <p style={{ fontSize: '11px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                Source: {card.source}
              </p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Survey Data */}
      <section className="landing-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-label">Primary Survey — 250 MSME Units</div>
          <h2 className="section-title">The Data Speaks</h2>

          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '24px', marginBottom: '32px' }}>
            {[
              { value: '63%', label: 'Operating at <40% capacity', color: 'var(--risk-red)' },
              { value: '78%', label: 'No fuel buffer beyond 7 days', color: 'var(--risk-yellow)' },
              { value: '92%', label: 'No real-time supply chain info', color: 'var(--risk-red)' },
            ].map((item, i) => (
              <motion.div
                key={i}
                style={{
                  textAlign: 'center',
                  padding: '40px 20px',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                }}
                initial={{ opacity: 0, scale: 0.9 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '56px',
                  fontWeight: 900,
                  color: item.color,
                  lineHeight: 1,
                  marginBottom: '8px',
                }}>
                  {item.value}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.label}</div>
              </motion.div>
            ))}
          </div>

          <div style={{
            textAlign: 'center',
            padding: '24px',
            background: 'rgba(239, 68, 68, 0.05)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '12px',
          }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>
              <strong style={{ color: 'var(--risk-red)' }}>The Gap:</strong> No technology exists to map 12.8 million MSMEs by fuel dependency, predict unit-level risks, or enable dynamic resource allocation during crises.{' '}
              <strong style={{ color: 'var(--text-primary)' }}>Government reacts — it cannot predict.</strong>
            </p>
          </div>
        </motion.div>
      </section>

      {/* How It Works */}
      <section className="landing-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-label">The Solution</div>
          <h2 className="section-title">How MERP Works</h2>
        </motion.div>

        <div className="how-steps">
          {steps.map((step, i) => (
            <motion.div
              key={i}
              className="how-step"
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <div className="how-step-number">{step.num}</div>
              <div className="how-step-content">
                <h4>{step.icon} {step.title}</h4>
                <p>{step.desc}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Impact */}
      <section className="landing-section">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-label">Direct Impact</div>
          <h2 className="section-title">What MERP Delivers</h2>

          <div className="impact-grid">
            {[
              {
                icon: '👷',
                value: '110M',
                label: 'Livelihoods Protected',
                detail: 'Workers across ceramics, textiles, auto parts, restaurants',
              },
              {
                icon: '💰',
                value: '₹4.2L Cr',
                label: 'Exports Saved',
                detail: 'Annual export value protected from disruption',
              },
              {
                icon: '📊',
                value: 'Day 1',
                label: 'Predictive Reports',
                detail: 'District officials know which factories shut tomorrow',
              },
            ].map((item, i) => (
              <motion.div
                key={i}
                className="impact-card"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div className="impact-icon">{item.icon}</div>
                <div className="impact-value">{item.value}</div>
                <div className="impact-label">{item.label}</div>
                <div className="impact-detail">{item.detail}</div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Feasibility */}
      <section className="landing-section" style={{ textAlign: 'center', paddingBottom: '100px' }}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          <div className="section-label">Feasibility</div>
          <h2 className="section-title">Built for Reality</h2>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: '24px',
            marginBottom: '48px',
          }}>
            {[
              { value: '₹15L', label: 'Development Cost' },
              { value: '8 Weeks', label: 'Build Timeline' },
              { value: '12.8M', label: 'Scale in 12 Months' },
              { value: 'CSR', label: 'Funded by OMCs' },
            ].map((item, i) => (
              <motion.div
                key={i}
                style={{
                  padding: '32px',
                  background: 'var(--glass-bg)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: '16px',
                }}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
              >
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: '32px',
                  fontWeight: 900,
                  color: 'var(--primary)',
                  marginBottom: '4px',
                }}>
                  {item.value}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{item.label}</div>
              </motion.div>
            ))}
          </div>

          {/* Bottom Line */}
          <div style={{
            padding: '48px',
            background: 'linear-gradient(135deg, rgba(255, 107, 43, 0.08), rgba(255, 107, 43, 0.02))',
            border: '1px solid rgba(255, 107, 43, 0.15)',
            borderRadius: '24px',
            maxWidth: '800px',
            margin: '0 auto',
          }}>
            <h3 style={{ fontSize: '24px', marginBottom: '16px' }}>The Bottom Line</h3>
            <p style={{ color: 'var(--text-secondary)', fontSize: '17px', lineHeight: 1.7 }}>
              When the next crisis hits, India will finally know which factories need fuel before they go dark.
              MERP turns a <strong style={{ color: 'var(--primary)' }}>reactive government into a predictive one</strong>.
              Blind MSMEs become visible. A national emergency becomes manageable.
            </p>
            <button
              className="btn btn-primary btn-lg"
              style={{ marginTop: '24px' }}
              onClick={() => navigate('/dashboard')}
            >
              Explore the Prototype <ArrowRight size={20} />
            </button>
          </div>
        </motion.div>
      </section>
    </div>
  );
}
