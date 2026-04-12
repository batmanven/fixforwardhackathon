export default function TopBar() {
  const tickerItems = [
    { text: 'MORBI: 12 ceramic units face shutdown within 48hrs', color: 'red' },
    { text: 'LPG wait time now 25 days in Gujarat, Maharashtra', color: 'red' },
    { text: '15,000+ restaurants shut in Pune, Surat, Ahmedabad', color: 'red' },
    { text: '60,000 tonnes basmati rice stranded at Kandla port', color: 'yellow' },
    { text: 'Medicine prices projected +30% in 60 days', color: 'yellow' },
    { text: 'Ludhiana auto parts: 63% units below 40% capacity', color: 'red' },
    { text: 'BPCL emergency allocation approved for 5 districts', color: 'green' },
    { text: 'Jaishankar confirms supply chain disruptions in Parliament', color: 'red' },
  ];

  return (
    <div className="topbar">
      <div className="topbar-crisis-ticker">
        <div className="ticker-track">
          {[...tickerItems, ...tickerItems].map((item, i) => (
            <span key={i} className="ticker-item">
              <span className={`ticker-dot ${item.color}`} />
              {item.text}
            </span>
          ))}
        </div>
      </div>
      <div className="topbar-right">
        <div className="topbar-live-badge">
          <span className="live-dot" />
          LIVE
        </div>
        <span className="topbar-date">11 Mar 2026 • 20:00 IST</span>
      </div>
    </div>
  );
}
