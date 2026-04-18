import { useState, useEffect } from 'react';

export default function TopBar() {
  const [news, setNews] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  
  const fallbackTicker = [
    { text: 'MORBI: 12 ceramic units face shutdown within 48hrs', color: 'red' },
    { text: 'LPG wait time now 25 days in Gujarat, Maharashtra', color: 'red' },
    { text: '15,000+ restaurants shut in Pune, Surat, Ahmedabad', color: 'red' },
    { text: '60,000 tonnes basmati rice stranded at Kandla port', color: 'yellow' },
    { text: 'Medicine prices projected +30% in 60 days', color: 'yellow' },
    { text: 'Ludhiana auto parts: 63% units below 40% capacity', color: 'red' },
    { text: 'BPCL emergency allocation approved for 5 districts', color: 'green' },
    { text: 'Jaishankar confirms supply chain disruptions in Parliament', color: 'red' },
  ];

  useEffect(() => {
    const fetchNews = async () => {
      const apiKey = import.meta.env.VITE_NEWS_API_KEY;
      if (!apiKey) {
        setNews(fallbackTicker);
        return;
      }

      try {
        const q = encodeURIComponent('India fuel crisis MSME LPG');
        const response = await fetch(
          `https://newsapi.org/v2/everything?q=${q}&sortBy=publishedAt&pageSize=5&apiKey=${apiKey}`
        );
        const data = await response.json();
        
        if (data.articles && data.articles.length > 0) {
          const liveNews = data.articles.map(art => ({
            text: `${art.source.name.toUpperCase()}: ${art.title}`,
            color: 'yellow'
          }));
          setNews([...liveNews, ...fallbackTicker]);
        } else {
          setNews(fallbackTicker);
        }
      } catch (error) {
        console.error('Failed to fetch news:', error);
        setNews(fallbackTicker);
      }
    };

    fetchNews();
    const newsInterval = setInterval(fetchNews, 300000); // 5 mins
    
    // Real-time Clock
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); 

    return () => {
      clearInterval(newsInterval);
      clearInterval(clockInterval);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formattedDate = currentTime.toLocaleDateString('en-GB', {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }).replace(/,/g, '');

  const formattedTime = currentTime.toLocaleTimeString('en-GB', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false
  });

  const itemsToDisplay = news.length > 0 ? news : fallbackTicker;

  return (
    <div className="topbar">
      <div className="topbar-crisis-ticker">
        <div className="ticker-track">
          {[...itemsToDisplay, ...itemsToDisplay].map((item, i) => (
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
        <span className="topbar-date">{formattedDate} • {formattedTime} IST</span>
      </div>
    </div>
  );
}
