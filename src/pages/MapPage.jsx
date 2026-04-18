import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { getLiveMSMEs, clusters } from '../data/msmeData';
import { getLiveDealers } from '../data/dealerData';
import { getRiskLabel } from '../utils/riskCalculator';

const riskColors = {
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#22C55E',
};

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0 && bounds[0][0] !== 8) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function MapPage() {
  const [msmeList, setMsmeList] = useState([]);
  const [dealerList, setDealerList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showDealers, setShowDealers] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [msmes, dealers] = await Promise.all([
        getLiveMSMEs(),
        getLiveDealers()
      ]);
      setMsmeList(msmes);
      setDealerList(dealers);
      setLoading(false);
    };
    loadData();
  }, []);

  const filteredMSMEs = useMemo(() => {
    let list = msmeList;
    if (filter !== 'all') list = list.filter(m => m.riskLevel === filter);
    if (selectedCluster) list = list.filter(m => m.cluster === selectedCluster);
    return list;
  }, [msmeList, filter, selectedCluster]);

  const bounds = useMemo(() => {
    if (filteredMSMEs.length > 0) {
      return filteredMSMEs.map(m => [m.lat, m.lng]);
    }
    return [[8, 68], [35, 97]];
  }, [filteredMSMEs]);

  const clusterSummary = useMemo(() => {
    const summary = {};
    Object.keys(clusters).forEach(key => {
      const units = msmeList.filter(m => m.cluster === key);
      summary[key] = {
        ...clusters[key],
        key,
        total: units.length,
        red: units.filter(m => m.riskLevel === 'red').length,
        yellow: units.filter(m => m.riskLevel === 'yellow').length,
        green: units.filter(m => m.riskLevel === 'green').length,
        employees: units.reduce((s, m) => s + m.employees, 0),
      };
    });
    return summary;
  }, [msmeList]);

  if (loading) {
    return (
      <div className="page-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '80vh' }}>
        <div style={{ textAlign: 'center' }}>
          <div className="pulse-dot" style={{ margin: '0 auto 16px' }} />
          <p style={{ color: 'var(--text-secondary)' }}>Mapping crisis clusters...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>MSME Risk Map — Live</h2>
            <p>Geospatial intelligence showing {msmeList.length} units from live database</p>
          </div>
        </div>
      </div>

      <div className="map-controls">
        {[
          { key: 'all', label: 'All Units', count: msmeList.length },
          { key: 'red', label: '🔴 Critical', count: msmeList.filter(m => m.riskLevel === 'red').length },
          { key: 'yellow', label: '🟡 Warning', count: msmeList.filter(m => m.riskLevel === 'yellow').length },
          { key: 'green', label: '🟢 Stable', count: msmeList.filter(m => m.riskLevel === 'green').length },
        ].map(item => (
          <button
            key={item.key}
            className={`map-filter-btn ${filter === item.key ? 'active' : ''}`}
            onClick={() => setFilter(item.key)}
          >
            {item.label}
            <span className="filter-count">{item.count}</span>
          </button>
        ))}
        <div style={{ marginLeft: 'auto' }} />
        <button
          className={`map-filter-btn ${showDealers ? 'active' : ''}`}
          onClick={() => setShowDealers(!showDealers)}
        >
          ⛽ Dealers <span className="filter-count">{dealerList.length}</span>
        </button>
      </div>

      <div className="filter-pills">
        <button
          className={`filter-pill ${!selectedCluster ? 'active' : ''}`}
          onClick={() => setSelectedCluster(null)}
        >All Clusters</button>
        {Object.values(clusterSummary).filter(c => c.total > 0).map(c => (
          <button
            key={c.key}
            className={`filter-pill ${selectedCluster === c.key ? 'active' : ''}`}
            onClick={() => setSelectedCluster(c.key)}
          >{c.name} ({c.total})</button>
        ))}
      </div>

      <div className="map-container">
        <MapContainer center={[22.5, 75]} zoom={5} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution="&copy; CARTO"
          />
          <FitBounds bounds={bounds} />
          {filteredMSMEs.map(msme => (
            <CircleMarker
              key={msme.id}
              center={[msme.lat, msme.lng]}
              radius={msme.riskLevel === 'red' ? 7 : 5}
              fillColor={riskColors[msme.riskLevel]}
              color={riskColors[msme.riskLevel]}
              weight={1}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{msme.industryIcon} {msme.unitName}</h4>
                  <p>{msme.clusterName} • {msme.id}</p>
                  <div className="popup-stats">
                    <div className="popup-stat"><strong>{msme.daysOfFuel}d</strong> Fuel</div>
                    <div className="popup-stat"><strong>{msme.employees}</strong> Workers</div>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span className={`risk-badge ${msme.riskLevel}`}>{getRiskLabel(msme.riskLevel)}</span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {showDealers && dealerList.map(dealer => (
            <CircleMarker
              key={dealer.id}
              center={[dealer.lat, dealer.lng]}
              radius={4}
              fillColor="#3B82F6"
              color="#3B82F6"
              weight={1}
              fillOpacity={0.4}
            >
              <Popup>
                <h4>⛽ {dealer.name}</h4>
                <p>{dealer.stockPct}% Stock • {dealer.status}</p>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>
    </div>
  );
}
