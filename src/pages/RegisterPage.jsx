import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Phone, PhoneOff, Mic, Settings, X, Cpu } from 'lucide-react';
import { calculateFuelScore, getRiskColor, getRiskLabel } from '../utils/riskCalculator';
import VapiModule from '@vapi-ai/web';

// Fix for Vite ESM vs CJS packaging
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
  {
    id: 'welcome',
    prompt: 'Welcome to MERP — MSME Energy Resilience Platform.',
    promptHi: 'MERP में आपका स्वागत है — MSME ऊर्जा लचीलापन मंच।',
    type: 'info',
  },
  {
    id: 'language',
    prompt: 'Please select your preferred language:',
    promptHi: 'कृपया अपनी भाषा चुनें:',
    type: 'select',
    options: languages,
  },
  {
    id: 'industry',
    prompt: 'What does your unit manufacture?',
    promptHi: 'आपकी इकाई क्या बनाती है?',
    type: 'select',
    options: industries,
  },
  {
    id: 'dailyUsage',
    prompt: 'How many kg of LPG/Gas does your unit use daily?',
    promptHi: 'आपकी इकाई रोज़ाना कितने किलो LPG/गैस का उपयोग करती है?',
    type: 'number',
    placeholder: 'e.g., 45',
    unit: 'kg/day',
  },
  {
    id: 'currentStock',
    prompt: 'What is your current fuel stock in kg?',
    promptHi: 'आपका वर्तमान ईंधन स्टॉक कितने किलो है?',
    type: 'number',
    placeholder: 'e.g., 90',
    unit: 'kg',
  },
  {
    id: 'employees',
    prompt: 'How many workers are employed at your unit?',
    promptHi: 'आपकी इकाई में कितने कर्मचारी कार्यरत हैं?',
    type: 'number',
    placeholder: 'e.g., 120',
    unit: 'workers',
  },
  {
    id: 'exports',
    prompt: 'Do you have pending export orders?',
    promptHi: 'क्या आपके पास बकाया निर्यात ऑर्डर हैं?',
    type: 'select',
    options: [
      { key: 'yes', label: 'Yes — Active export orders', emoji: '📦' },
      { key: 'no', label: 'No — Domestic only', emoji: '🏠' },
    ],
  },
];

export default function RegisterPage() {
  const [callActive, setCallActive] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState({});
  const [showResult, setShowResult] = useState(false);
  const [scoreData, setScoreData] = useState(null);
  const [isRinging, setIsRinging] = useState(false);
  const scrollRef = useRef(null);

  // Vapi integration state
  const [useVapi, setUseVapi] = useState(false);
  const [vapiKeys, setVapiKeys] = useState({ 
    publicKey: import.meta.env.VITE_VAPI_PUBLIC_KEY || '', 
    assistantId: import.meta.env.VITE_VAPI_ASSISTANT_ID || '' 
  });
  const [showVapiConfig, setShowVapiConfig] = useState(false);
  const [vapiTranscript, setVapiTranscript] = useState([]);
  const vapiRef = useRef(null);

  useEffect(() => {
    // Check if we have env vars set, if so, default to using Vapi
    if (import.meta.env.VITE_VAPI_PUBLIC_KEY && import.meta.env.VITE_VAPI_ASSISTANT_ID) {
      setUseVapi(true);
    }
    
    // Override with localStorage if the user configured it via the UI
    const keys = localStorage.getItem('vapiKeys');
    if (keys) setVapiKeys(JSON.parse(keys));
  }, []);

  function handleSaveVapiKeys() {
    localStorage.setItem('vapiKeys', JSON.stringify(vapiKeys));
    setShowVapiConfig(false);
    setUseVapi(true);
  }

  function startCall() {
    if (useVapi) {
      if (!vapiKeys.publicKey || !vapiKeys.assistantId) {
        setShowVapiConfig(true);
        return;
      }
      setIsRinging(true);
      setShowResult(false);
      
      const vapi = new Vapi(vapiKeys.publicKey);
      vapiRef.current = vapi;

      vapi.on('call-start', () => {
        setIsRinging(false);
        setCallActive(true);
        setCurrentStep(-1); // -1 denotes Vapi mode active
        setVapiTranscript([]);
      });

      vapi.on('message', (message) => {
        if (message.type === 'transcript' && message.transcriptType === 'final') {
          setVapiTranscript((prev) => [...prev, { role: message.role, text: message.transcript }]);
        }
      });

      vapi.on('call-end', () => {
        setCallActive(false);
        vapiRef.current = null;
        
        // Mock some answers gathered from the Voice AI
        setAnswers({ employees: 120 });

        const result = calculateFuelScore({
          dailyUsageKg: 45,
          currentStockKg: 20, // Forces high risk for demo
          employees: 120,
          hasExportOrders: true,
          capacityUtilization: 35,
        });

        setScoreData(result);
        setShowResult(true);
      });

      vapi.on('error', (e) => {
        console.error(e);
        alert(`Vapi Error: ${e.message || "Failed to start call"}`);
        setIsRinging(false);
        setCallActive(false);
        vapiRef.current = null;
      });

      vapi.start(vapiKeys.assistantId);

    } else {
      // Normal mock IVR Mode
      setIsRinging(true);
      setTimeout(() => {
        setIsRinging(false);
        setCallActive(true);
        setCurrentStep(0);
        setAnswers({});
        setShowResult(false);
        setScoreData(null);
      }, 1500);
    }
  }

  function endCall() {
    if (useVapi && vapiRef.current) {
      vapiRef.current.stop();
    } else {
      setCallActive(false);
      setCurrentStep(0);
      setIsRinging(false);
    }
  }

  function handleAnswer(stepId, value) {
    const newAnswers = { ...answers, [stepId]: value };
    setAnswers(newAnswers);

    setTimeout(() => {
      if (currentStep < ivrFlow.length - 1) {
        setCurrentStep(currentStep + 1);
      } else {
        // Calculate score
        const result = calculateFuelScore({
          dailyUsageKg: parseFloat(newAnswers.dailyUsage) || 30,
          currentStockKg: parseFloat(newAnswers.currentStock) || 60,
          employees: parseInt(newAnswers.employees) || 50,
          hasExportOrders: newAnswers.exports === 'yes',
          capacityUtilization: 35,
        });
        setScoreData(result);
        setShowResult(true);
      }
    }, 300);
  }

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [currentStep, vapiTranscript]);

  const step = currentStep >= 0 ? ivrFlow[currentStep] : null;

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2>📞 IVR Registration Simulator</h2>
          <p>Experience how an MSME owner registers via a simple phone call — no app, no internet needed.</p>
        </div>
        
        {/* Vapi Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>
            {useVapi ? 'Voice AI Mode Active' : 'Simulation Mode'}
          </span>
          <button 
            className={`btn ${useVapi ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ borderRadius: 'var(--radius-full)' }}
            onClick={() => {
              if (!useVapi && (!vapiKeys.publicKey || !vapiKeys.assistantId)) {
                setShowVapiConfig(true);
              } else {
                setUseVapi(!useVapi);
              }
            }}
          >
            <Cpu size={16} /> 
            {useVapi ? 'Vapi Enabled' : 'Enable Vapi'}
          </button>
          <button className="btn btn-ghost" onClick={() => setShowVapiConfig(!showVapiConfig)}>
            <Settings size={18} />
          </button>
        </div>
      </div>

      {showVapiConfig && (
        <motion.div 
          initial={{ opacity: 0, y: -10 }} 
          animate={{ opacity: 1, y: 0 }}
          className="glass-card" 
          style={{ marginBottom: '24px', position: 'relative' }}
        >
          <button 
            onClick={() => setShowVapiConfig(false)}
            style={{ position: 'absolute', top: '16px', right: '16px', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-tertiary)' }}
          >
            <X size={20} />
          </button>
          <div className="glass-card-header">
            <h3>⚙️ Configure Vapi Voice AI</h3>
          </div>
          <div className="glass-card-body">
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
              <div>
                <label className="form-label">Public API Key</label>
                <input 
                  type="password" 
                  className="form-input" 
                  placeholder="Insert Vapi Public Key..." 
                  value={vapiKeys.publicKey}
                  onChange={(e) => setVapiKeys({ ...vapiKeys, publicKey: e.target.value })}
                />
              </div>
              <div>
                <label className="form-label">Assistant ID</label>
                <input 
                  type="text" 
                  className="form-input" 
                  placeholder="Insert Assistant ID..." 
                  value={vapiKeys.assistantId}
                  onChange={(e) => setVapiKeys({ ...vapiKeys, assistantId: e.target.value })}
                />
              </div>
            </div>
            <div style={{ marginTop: '24px', display: 'flex', gap: '12px' }}>
              <button className="btn btn-primary" onClick={handleSaveVapiKeys}>Save & Enable Vapi</button>
            </div>
          </div>
        </motion.div>
      )}

      <div className="reg-form-container">
        {/* Phone Simulator */}
        <div>
          <div className="ivr-phone">
            <div className="ivr-phone-screen" ref={scrollRef}>
              {!callActive && !isRinging ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '24px' }}>
                  <div style={{ fontSize: '48px' }}>📞</div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '15px', fontWeight: 600, marginBottom: '4px' }}>MERP Toll-Free</div>
                    <div style={{ fontSize: '22px', fontFamily: 'var(--font-mono)', color: 'var(--primary)' }}>1800-MERP-HELP</div>
                    <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '8px' }}>
                      Tap the green button to start
                    </div>
                  </div>
                </div>
              ) : isRinging ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', gap: '16px' }}>
                  <motion.div
                    animate={{ scale: [1, 1.2, 1] }}
                    transition={{ repeat: Infinity, duration: 1 }}
                    style={{ fontSize: '48px' }}
                  >
                    📞
                  </motion.div>
                  <div style={{ color: 'var(--risk-green)', fontWeight: 600 }}>Connecting...</div>
                  <div style={{ fontFamily: 'var(--font-mono)', fontSize: '14px', color: 'var(--text-secondary)' }}>
                    1800-MERP-HELP
                  </div>
                </div>
              ) : (
                <>
                  <div className="ivr-phone-header">
                    <div className="call-status">
                      <Mic size={12} style={{ display: 'inline', marginRight: '4px' }} />
                      {useVapi ? 'AI AGENT CONNECTED' : 'ACTIVE CALL'}
                    </div>
                    <div className="call-number">1800-MERP-HELP</div>
                  </div>

                  {useVapi && currentStep === -1 ? (
                    // Vapi live transcript rendering
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingBottom: '16px' }}>
                      {vapiTranscript.length === 0 && (
                        <div style={{ color: 'var(--text-tertiary)', textAlign: 'center', fontStyle: 'italic', fontSize: '13px', marginTop: '24px' }}>
                          Agent is connected. Start speaking...
                        </div>
                      )}
                      {vapiTranscript.map((msg, i) => (
                        <div key={i} style={{
                          alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                          background: msg.role === 'user' ? 'rgba(255, 107, 43, 0.15)' : 'var(--surface)',
                          border: `1px solid ${msg.role === 'user' ? 'rgba(255, 107, 43, 0.3)' : 'var(--border)'}`,
                          padding: '10px 14px',
                          borderRadius: '12px',
                          fontSize: '13px',
                          maxWidth: '90%',
                          lineHeight: '1.5',
                          color: 'var(--text-secondary)'
                        }}>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', color: msg.role === 'user' ? 'var(--primary)' : 'var(--text-tertiary)', display: 'block', marginBottom: '4px' }}>
                            {msg.role === 'user' ? 'You' : 'Agent'}
                          </span>
                          {msg.text}
                        </div>
                      ))}
                    </div>
                  ) : (
                    // Mock IVR rendering
                    <>
                      {/* Show completed steps */}
                      {ivrFlow.slice(0, currentStep).map((s, i) => (
                        <div key={s.id} style={{ marginBottom: '12px', opacity: 0.6 }}>
                          <div className="ivr-prompt">
                            <div className="prompt-label">Step {i + 1}</div>
                            {s.prompt}
                          </div>
                          <div style={{
                            textAlign: 'right',
                            fontSize: '13px',
                            padding: '6px 12px',
                            background: 'rgba(255, 107, 43, 0.1)',
                            borderRadius: '8px',
                            color: 'var(--primary)',
                            display: 'inline-block',
                            float: 'right',
                            marginBottom: '8px',
                          }}>
                            ✓ {answers[s.id]?.toString()?.substring(0, 30) || 'Acknowledged'}
                          </div>
                          <div style={{ clear: 'both' }} />
                        </div>
                      ))}

                      {/* Current step */}
                      {!showResult && step && (
                        <AnimatePresence>
                          <motion.div
                            key={step.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                          >
                            <div className="ivr-prompt">
                              <div className="prompt-label">Step {currentStep + 1} of {ivrFlow.length}</div>
                              {step.prompt}
                              <div style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginTop: '4px', fontStyle: 'italic' }}>
                                {step.promptHi}
                              </div>
                            </div>

                            {step.type === 'info' && (
                              <button
                                className="btn btn-primary"
                                style={{ width: '100%' }}
                                onClick={() => handleAnswer(step.id, 'acknowledged')}
                              >
                                Continue →
                              </button>
                            )}

                            {step.type === 'select' && (
                              <div className="ivr-options">
                                {step.options.map((opt, i) => (
                                  <div
                                    key={opt.key}
                                    className="ivr-option"
                                    onClick={() => handleAnswer(step.id, opt.key)}
                                  >
                                    <span className="option-key">{i + 1}</span>
                                    <span>{opt.emoji || ''} {opt.label}</span>
                                  </div>
                                ))}
                              </div>
                            )}

                            {step.type === 'number' && (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <input
                                  type="number"
                                  className="form-input"
                                  placeholder={step.placeholder}
                                  onKeyDown={(e) => {
                                    if (e.key === 'Enter' && e.target.value) {
                                      handleAnswer(step.id, e.target.value);
                                    }
                                  }}
                                  autoFocus
                                />
                                <button
                                  className="btn btn-primary"
                                  onClick={(e) => {
                                    const input = e.target.parentElement.querySelector('input');
                                    if (input.value) handleAnswer(step.id, input.value);
                                  }}
                                >
                                  →
                                </button>
                              </div>
                            )}
                          </motion.div>
                        </AnimatePresence>
                      )}
                    </>
                  )}

                  {/* Result */}
                  {showResult && scoreData && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      style={{ textAlign: 'center', padding: '16px 0' }}
                    >
                      <div style={{ fontSize: '12px', color: 'var(--risk-green)', fontWeight: 600, marginBottom: '12px' }}>
                        ✓ {useVapi ? 'CALL ANALYZED' : 'REGISTRATION COMPLETE'}
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginBottom: '16px',
                      }}>
                        Your Fuel Dependency Score:
                      </div>
                      <div style={{
                        fontSize: '64px',
                        fontWeight: 900,
                        fontFamily: 'var(--font-heading)',
                        color: getRiskColor(scoreData.riskLevel),
                        lineHeight: 1,
                      }}>
                        {scoreData.score}
                      </div>
                      <div style={{
                        fontSize: '13px',
                        fontWeight: 700,
                        color: getRiskColor(scoreData.riskLevel),
                        marginTop: '4px',
                      }}>
                        {getRiskLabel(scoreData.riskLevel)} RISK
                      </div>
                      <div style={{
                        fontSize: '14px',
                        color: 'var(--text-secondary)',
                        marginTop: '12px',
                      }}>
                        {scoreData.daysOfFuel} days of fuel remaining
                      </div>
                    </motion.div>
                  )}
                </>
              )}
            </div>

            {/* Phone keypad bottom */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: '24px', marginTop: '16px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
              {!callActive ? (
                <button
                  className="ivr-key call-btn"
                  style={{ width: '56px', height: '56px', borderRadius: '50%', aspectRatio: 'auto' }}
                  onClick={startCall}
                >
                  <Phone size={22} />
                </button>
              ) : (
                <button
                  className="ivr-key end-btn"
                  style={{ width: '56px', height: '56px', borderRadius: '50%', aspectRatio: 'auto' }}
                  onClick={endCall}
                >
                  <PhoneOff size={22} />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Result Panel */}
        <div className="reg-result">
          {showResult && scoreData ? (
            <>
              {/* Score Gauge */}
              <div className="glass-card" style={{ width: '100%' }}>
                <div className="glass-card-header">
                  <h3>📊 Fuel Dependency Analysis</h3>
                </div>
                <div className="glass-card-body">
                  <div className="score-gauge">
                    <svg viewBox="0 0 200 200">
                      <circle cx="100" cy="100" r="85" fill="none" stroke="var(--border)" strokeWidth="12" />
                      <circle
                        cx="100" cy="100" r="85"
                        fill="none"
                        stroke={getRiskColor(scoreData.riskLevel)}
                        strokeWidth="12"
                        strokeLinecap="round"
                        strokeDasharray={`${scoreData.score * 5.34} 534`}
                        style={{ filter: `drop-shadow(0 0 8px ${getRiskColor(scoreData.riskLevel)})` }}
                      />
                    </svg>
                    <div className="score-gauge-value">
                      <div className="gauge-number" style={{ color: getRiskColor(scoreData.riskLevel) }}>
                        {scoreData.score}
                      </div>
                      <div className="gauge-label">{getRiskLabel(scoreData.riskLevel)}</div>
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginTop: '24px' }}>
                    {[
                      { label: 'Fuel Urgency', value: scoreData.breakdown.fuelUrgency, max: 40 },
                      { label: 'Employment Impact', value: scoreData.breakdown.empImpact, max: 25 },
                      { label: 'Export Dependency', value: scoreData.breakdown.exportScore, max: 15 },
                      { label: 'Capacity Stress', value: scoreData.breakdown.capacityScore, max: 15 },
                    ].map((item, i) => (
                      <div key={i}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', marginBottom: '4px' }}>
                          <span style={{ color: 'var(--text-tertiary)' }}>{item.label}</span>
                          <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{item.value}/{item.max}</span>
                        </div>
                        <div className="progress-bar">
                          <div
                            className="progress-fill"
                            style={{
                              width: `${(item.value / item.max) * 100}%`,
                              background: getRiskColor(scoreData.riskLevel),
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* SMS Preview */}
              <div className="glass-card" style={{ width: '100%' }}>
                <div className="glass-card-header">
                  <h3>📱 SMS Alert Preview</h3>
                </div>
                <div className="glass-card-body">
                  <div className="sms-preview">
                    MERP ALERT: Your unit has {scoreData.daysOfFuel} days of fuel remaining.
                    {scoreData.riskLevel === 'red'
                      ? ` CRITICAL shutdown risk. ${answers.employees || '50'} jobs at risk. Reply 1 for EMERGENCY FUEL. Reply 2 for nearby dealer.`
                      : scoreData.riskLevel === 'yellow'
                        ? ' Moderate risk. Plan refill soon. Reply 1 for dealer availability.'
                        : ' Status: Stable. Next check at 8 PM tonight.'
                    }
                  </div>
                  <div style={{ marginTop: '12px', fontSize: '12px', color: 'var(--text-tertiary)' }}>
                    Sent to: +91 XXXXX XXXXX • via MERP SMS Gateway • {scoreData.riskLevel === 'red' ? 'Every 6 hours' : 'Daily at 8 PM'}
                  </div>
                </div>
              </div>
            </>
          ) : (
            <div className="glass-card" style={{ width: '100%' }}>
              <div className="glass-card-body" style={{ textAlign: 'center', padding: '60px 40px' }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>📞</div>
                <h3 style={{ fontSize: '20px', marginBottom: '8px' }}>Start a Simulated Call</h3>
                <p style={{ color: 'var(--text-secondary)', fontSize: '14px', lineHeight: 1.6 }}>
                  Tap the green call button to experience the registration flow.
                  {useVapi 
                    ? ' You are in Voice AI mode. Once connected, speak to the Vapi agent. The system will analyze the conversation when the call ends.'
                    : ' An MSME owner simply dials a toll-free number — no app, no internet, no smartphone needed. The system works on any feature phone via missed call + SMS.'}
                </p>
                <div style={{
                  marginTop: '24px',
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '12px',
                  textAlign: 'left',
                }}>
                  {[
                    { icon: '🆓', text: 'Zero cost to MSME' },
                    { icon: '📱', text: 'Works on 2G phones' },
                    { icon: '🗣️', text: useVapi ? 'Voice AI Agent' : '8 Indian languages' },
                    { icon: '⚡', text: '90 seconds to register' },
                  ].map((item, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '13px', color: 'var(--text-secondary)' }}>
                      <span>{item.icon}</span> {item.text}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
