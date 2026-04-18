import { useState, useEffect, useRef } from 'react';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, Settings, X, Cpu, CloudSync, CheckCircle2, MessageSquareText } from 'lucide-react';
import { calculateFuelScore, getRiskColor, getRiskLabel } from '../utils/riskCalculator';
import { supabase } from '../utils/supabaseClient';
import VapiModule from '@vapi-ai/web';

const Vapi = VapiModule.default || VapiModule;

const industries = [
  { key: 'ceramics', label: 'Ceramics / Tiles', emoji: '🏭' },
  { key: 'textiles', label: 'Textiles / Fabric', emoji: '🧵' },
  { key: 'autoParts', label: 'Auto Parts / Engineering', emoji: '⚙️' },
  { key: 'restaurant', label: 'Restaurant / Eatery', emoji: '🍽️' },
  { key: 'pharma', label: 'Pharmaceuticals', emoji: '💊' },
  { key: 'food', label: 'Food Processing', emoji: '🥫' },
];

const languages = [
  { key: 'hindi', label: 'हिंदी (Hindi)' },
  { key: 'gujarati', label: 'ગુજરાતી (Gujarati)' },
  { key: 'marathi', label: 'मराठी (Marathi)' },
  { key: 'tamil', label: 'தமிழ் (Tamil)' },
  { key: 'english', label: 'English' },
];

const ivrFlow = [
  { id: 'welcome', prompt: 'Welcome to MERP.', type: 'info' },
  { id: 'language', prompt: 'Select language:', type: 'select', options: languages },
  { id: 'industry', prompt: 'Units manufacture?', type: 'select', options: industries },
  { id: 'dailyUsage', prompt: 'Daily LPG (kg)?', type: 'number', unit: 'kg/day' },
  { id: 'currentStock', prompt: 'Current stock (kg)?', type: 'number', unit: 'kg' },
  { id: 'employees', prompt: 'Worker count?', type: 'number', unit: 'workers' },
];

export default function RegisterPage() {
  const [callActive, setCallActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const scrollRef = useRef(null);

  const [useVapi, setUseVapi] = useState(!!(import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID));
  const [vapiKeys] = useState({
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '',
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || ''
  });
  const [showVapiConfig, setShowVapiConfig] = useState(false);
  const [vapiTranscript, setVapiTranscript] = useState([]);
  const vapiRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  }, [vapiTranscript, currentStep, isSyncing, showResult, smsSent]);

  function startCall() {
    if (useVapi) {
      if (!vapiKeys.publicKey || !vapiKeys.assistantId) {
        setShowVapiConfig(true);
        return;
      }
      setIsRinging(true);
      setShowResult(false);
      setSmsSent(false);

      const vapi = new Vapi(vapiKeys.publicKey);
      vapiRef.current = vapi;

      vapi.on('call-start', () => {
        setIsRinging(false);
        setCallActive(true);
        setCurrentStep(-1);
        setVapiTranscript([]);
      });

      vapi.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setVapiTranscript((prev) => [...prev, { role: message.role, text: message.transcript }]);
        }
      });

      vapi.on('call-end', async () => {
        setCallActive(false);
        vapiRef.current = null;
        setIsSyncing(true);

        setTimeout(async () => {
          const { data } = await supabase
            .from('msme_registrations')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(1)
            .single();

          if (data) {
            setScoreData({
              score: data.fuel_score,
              daysOfFuel: data.days_of_fuel || 4,
              riskLevel: data.risk_level,
              breakdown: { fuelUrgency: 35, empImpact: 20, exportScore: 10, capacityScore: 10 }
            });
          } else {
            setScoreData(calculateFuelScore({ dailyUsageKg: 45, currentStockKg: 20, employees: 120 }));
          }
          setIsSyncing(false);
          setShowResult(true);

          setTimeout(() => setSmsSent(true), 1000);
        }, 2500);
      });

      vapi.start(vapiKeys.assistantId);
    } else {
      setIsRinging(true);
      setSmsSent(false);
      setTimeout(() => {
        setIsRinging(false);
        setCallActive(true);
        setCurrentStep(0);
        setAnswers({});
        setShowResult(false);
      }, 1500);
    }
  }

  function endCall() {
    if (useVapi && vapiRef.current) vapiRef.current.stop();
    else setCallActive(false);
  }

  function handleAnswer(stepId, value) {
    const newAnswers = { ...answers, [stepId]: value };
    setAnswers(newAnswers);
    if (currentStep < ivrFlow.length - 1) setCurrentStep(currentStep + 1);
    else {
      setScoreData(calculateFuelScore({
        dailyUsageKg: parseFloat(newAnswers.dailyUsage) || 30,
        currentStockKg: parseFloat(newAnswers.currentStock) || 60,
        employees: parseInt(newAnswers.employees) || 50,
      }));
      setShowResult(true);
      setTimeout(() => setSmsSent(true), 1500);
    }
  }

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div className="pulse-dot" />
            <span style={{ fontSize: '10px', color: 'var(--primary)', fontWeight: 800, letterSpacing: '2px' }}>LIVE INTELLIGENCE</span>
          </div>
          <h2>Voice AI Simulator</h2>
          <p>India's first energy intelligence flow for MSMEs.</p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className={`btn ${useVapi ? 'btn-primary' : 'btn-secondary'}`} onClick={() => setUseVapi(!useVapi)}>
            <Cpu size={16} /> {useVapi ? 'VAPI AI ACTIVE' : 'ENABLE VAPI'}
          </button>
          <button className="btn btn-ghost" onClick={() => setShowVapiConfig(!showVapiConfig)}><Settings size={18} /></button>
        </div>
      </div>

      <div className="reg-form-container">
        <div className="ivr-phone">
          <div className="ivr-phone-screen" ref={scrollRef}>
            {isSyncing ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', padding: '20px', textAlign: 'center' }}>
                <div className="sync-orbit">
                  <CloudSync size={48} color="var(--primary)" />
                </div>
                <div style={{ marginTop: '24px', fontWeight: 700, fontSize: '18px' }}>Analyzing Cloud Data</div>
                <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Syncing Vapi Transcript with Supabase...</div>
              </div>
            ) : !callActive && !isRinging ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <motion.div
                  animate={{ y: [0, -10, 0] }}
                  transition={{ repeat: Infinity, duration: 2 }}
                  style={{ fontSize: '64px', marginBottom: '20px' }}
                >
                  📞
                </motion.div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontWeight: 800, fontSize: '24px', letterSpacing: '-0.5px' }}>1800-MERP-HELP</div>
                  <div style={{ fontSize: '13px', color: 'var(--text-tertiary)', marginTop: '8px' }}>Toll-free crisis line</div>
                  <button className="btn btn-primary" style={{ marginTop: '24px', borderRadius: 'var(--radius-full)' }} onClick={startCall}>
                    Call Now
                  </button>
                </div>
              </div>
            ) : isRinging ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                <div className="pulse-circle">
                  <Phone size={32} color="var(--risk-green)" />
                </div>
                <div style={{ marginTop: '24px', color: 'var(--risk-green)', fontWeight: 700, fontSize: '18px' }}>RINGING...</div>
                <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>ESTABLISHING SECURE LINE</div>
              </div>
            ) : (
              <div style={{ padding: '12px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                <div className="call-header-mini">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <div className="live-dot" />
                    <span style={{ fontSize: '10px', fontWeight: 800 }}>{useVapi ? 'VAPI AI CONNECTED' : 'IVR SESSION ACTIVE'}</span>
                  </div>
                  <span style={{ fontSize: '10px', color: 'var(--text-tertiary)' }}>00:45</span>
                </div>

                {vapiTranscript.map((msg, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    className={`chat-bubble ${msg.role === 'user' ? 'user' : 'ai'}`}
                  >
                    <div className="bubble-role">{msg.role === 'user' ? 'YOU' : 'AI REGISTRAR'}</div>
                    <div className="bubble-text">{msg.text}</div>
                  </motion.div>
                ))}

                {!useVapi && ivrFlow[currentStep] && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="ivr-prompt-card">
                    <p style={{ fontWeight: 600, fontSize: '15px' }}>{ivrFlow[currentStep].prompt}</p>
                    {ivrFlow[currentStep].type === 'select' && (
                      <div className="ivr-options-grid">
                        {ivrFlow[currentStep].options.map(o => (
                          <button key={o.key} className="option-btn" onClick={() => handleAnswer(ivrFlow[currentStep].id, o.key)}>
                            {o.emoji} {o.label}
                          </button>
                        ))}
                      </div>
                    )}
                    {ivrFlow[currentStep].type === 'number' && (
                      <div className="ivr-input-group">
                        <input type="number" placeholder="Enter value..." className="ivr-input" autoFocus onKeyDown={(e) => {
                          if (e.key === 'Enter') handleAnswer(ivrFlow[currentStep].id, e.target.value);
                        }} />
                        <button className="btn-go" onClick={(e) => handleAnswer(ivrFlow[currentStep].id, e.target.previousSibling.value)}>→</button>
                      </div>
                    )}
                  </motion.div>
                )}

                {showResult && scoreData && (
                  <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="result-phone-card">
                    <div className="status-badge">
                      <CheckCircle2 size={14} /> REGISTRATION COMPLETE
                    </div>
                    <div className="result-score" style={{ color: getRiskColor(scoreData.riskLevel) }}>
                      {scoreData.score}
                    </div>
                    <div className="result-label" style={{ background: `${getRiskColor(scoreData.riskLevel)}22`, color: getRiskColor(scoreData.riskLevel) }}>
                      {getRiskLabel(scoreData.riskLevel)} RISK
                    </div>
                    <p style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                      Predicted shutdown: {scoreData.daysOfFuel} days
                    </p>
                  </motion.div>
                )}

                {smsSent && (
                  <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    className="sms-notification-bubble"
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <MessageSquareText size={16} color="var(--primary)" />
                      <div>
                        <div style={{ fontSize: '10px', fontWeight: 800, color: 'var(--primary)' }}>TWILIO SMS SENT</div>
                        <div style={{ fontSize: '11px', lineHeight: 1.2 }}>"[MERP] Registration success. Risk Level: {scoreData?.riskLevel?.toUpperCase()}..."</div>
                      </div>
                    </div>
                  </motion.div>
                )}
              </div>
            )}
          </div>
          <div style={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
            {!callActive ? (
              <button className="btn-call-trigger start" onClick={startCall}><Phone /></button>
            ) : (
              <button className="btn-call-trigger end" onClick={endCall}><PhoneOff /></button>
            )}
          </div>
        </div>

        <div className="reg-result">
          {showResult ? (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="glass-card" style={{ border: `1px solid ${getRiskColor(scoreData.riskLevel)}44` }}>
                <div className="glass-card-header">
                  <h3 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <CloudSync size={20} /> Real-time Cloud Intelligence
                  </h3>
                </div>
                <div className="glass-card-body">
                  <div style={{ display: 'flex', alignItems: 'center', gap: '20px', marginBottom: '24px' }}>
                    <div className="score-meter-large" style={{ color: getRiskColor(scoreData.riskLevel), borderColor: getRiskColor(scoreData.riskLevel) }}>
                      {scoreData.score}
                    </div>
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '20px', color: 'var(--text-primary)' }}>{getRiskLabel(scoreData.riskLevel)} THREAT</div>
                      <div style={{ fontSize: '14px', color: 'var(--text-tertiary)', marginTop: '4px' }}>
                        Priority Score analyzed via Vapi Voice AI
                      </div>
                    </div>
                  </div>

                  <div className="sms-track-card">
                    <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '8px', display: 'flex', justifyContent: 'space-between' }}>
                      <span>Twilio SMS Monitoring</span>
                      <span style={{ color: 'var(--risk-green)' }}>● DELIVERED</span>
                    </div>
                    <div className="sms-visual-body">
                      <strong>[MERP ALERT]</strong> CRITICAL risk confirmed for your unit. Emergency fuel allocation code generated. Reply 1 for dealer list.
                    </div>
                  </div>

                  <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
                    <button className="btn btn-primary" style={{ flex: 1 }}>Reroute Fuel Now</button>
                    <button className="btn btn-secondary" style={{ flex: 1 }}>View Map</button>
                  </div>
                </div>
              </div>
            </motion.div>
          ) : (
            <div className="empty-state-v2">
              <div className="empty-graphic">
                <Mic size={40} color="var(--primary)" />
              </div>
              <h3>Voice AI Registration</h3>
              <p>Experience the "Peak" conversion of voice to actionable data. Our AI Agent handles complex dialects (Hindi/Gujarati) and syncs directly to the MSME Resilience Database.</p>

              <div className="feature-badges">
                <div className="f-badge">⚡ Real-time Sync</div>
                <div className="f-badge">📲 Twilio SMS Aware</div>
                <div className="f-badge">🛡️ Fraud Proof</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
