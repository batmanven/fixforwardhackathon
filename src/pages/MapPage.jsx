import { useState, useEffect, useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Popup, useMap } from 'react-leaflet';
import { msmeList, clusters } from '../data/msmeData';
import { dealerList } from '../data/dealerData';
import { getRiskColor, getRiskLabel } from '../utils/riskCalculator';
import { formatNumber } from '../utils/formatters';

const riskColors = {
  red: '#EF4444',
  yellow: '#F59E0B',
  green: '#22C55E',
};

function FitBounds({ bounds }) {
  const map = useMap();
  useEffect(() => {
    if (bounds && bounds.length > 0) {
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [bounds, map]);
  return null;
}

export default function MapPage() {
  const [filter, setFilter] = useState('all');
  const [showDealers, setShowDealers] = useState(false);
  const [selectedCluster, setSelectedCluster] = useState(null);

  const filteredMSMEs = useMemo(() => {
    let list = msmeList;
    if (filter !== 'all') list = list.filter(m => m.riskLevel === filter);
    if (selectedCluster) list = list.filter(m => m.cluster === selectedCluster);
    return list;
  }, [filter, selectedCluster]);

  const bounds = useMemo(() => {
    if (filteredMSMEs.length > 0) {
      return filteredMSMEs.map(m => [m.lat, m.lng]);
    }
    return [[8, 68], [35, 97]]; // India bounds
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
  }, []);

  return (
    <div className="page-container">
      <div className="page-header">
        <div className="page-header-actions">
          <div>
            <h2>🗺️ MSME Risk Map — India</h2>
            <p>Interactive map of {msmeList.length} registered MSMEs across crisis clusters</p>
          </div>
        </div>
      </div>

      {/* Filters */}
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
          ⛽ Dealers
          <span className="filter-count">{dealerList.length}</span>
        </button>
      </div>

      {/* Cluster Pills */}
      <div className="filter-pills">
        <button
          className={`filter-pill ${!selectedCluster ? 'active' : ''}`}
          onClick={() => setSelectedCluster(null)}
        >
          All Clusters
        </button>
        {Object.values(clusterSummary).map(c => (
          <button
            key={c.key}
            className={`filter-pill ${selectedCluster === c.key ? 'active' : ''}`}
            onClick={() => setSelectedCluster(selectedCluster === c.key ? null : c.key)}
          >
            {c.name} ({c.total})
          </button>
        ))}
      </div>

      {/* Map */}
      <div className="map-container">
        <MapContainer
          center={[22.5, 75]}
          zoom={5}
          style={{ height: '100%', width: '100%' }}
          zoomControl={true}
        >
          <TileLayer
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
            attribution='&copy; <a href="https://carto.com/">CARTO</a>'
          />

          <FitBounds bounds={bounds} />

          {/* MSME markers */}
          {filteredMSMEs.map(msme => (
            <CircleMarker
              key={msme.id}
              center={[msme.lat, msme.lng]}
              radius={msme.riskLevel === 'red' ? 7 : 5}
              fillColor={riskColors[msme.riskLevel]}
              color={riskColors[msme.riskLevel]}
              weight={1}
              opacity={0.8}
              fillOpacity={0.6}
            >
              <Popup>
                <div className="popup-content">
                  <h4>{msme.industryIcon} {msme.unitName}</h4>
                  <div className="popup-meta">
                    {msme.clusterName}, {msme.state} • {msme.id}
                  </div>
                  <div className="popup-stats">
                    <div className="popup-stat">
                      <strong style={{ color: getRiskColor(msme.riskLevel) }}>{msme.fuelScore}</strong> Risk Score
                    </div>
                    <div className="popup-stat">
                      <strong>{msme.daysOfFuel}d</strong> Fuel Left
                    </div>
                    <div className="popup-stat">
                      <strong>{msme.employees}</strong> Workers
                    </div>
                    <div className="popup-stat">
                      <strong>{msme.capacityUtilization}%</strong> Capacity
                    </div>
                  </div>
                  <div style={{ marginTop: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '11px',
                        fontWeight: 700,
                        background: `${getRiskColor(msme.riskLevel)}22`,
                        color: getRiskColor(msme.riskLevel),
                      }}
                    >
                      {getRiskLabel(msme.riskLevel)}
                    </span>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}

          {/* Dealer markers */}
          {showDealers && dealerList.map(dealer => (
            <CircleMarker
              key={dealer.id}
              center={[dealer.lat, dealer.lng]}
              radius={4}
              fillColor="#3B82F6"
              color="#3B82F6"
              weight={1}
              opacity={0.7}
              fillOpacity={0.4}
            >
              <Popup>
                <div className="popup-content">
                  <h4>⛽ {dealer.name}</h4>
                  <div className="popup-meta">{dealer.city}, {dealer.state}</div>
                  <div className="popup-stats">
                    <div className="popup-stat"><strong>{dealer.stockPct}%</strong> Stock</div>
                    <div className="popup-stat"><strong>{dealer.lpgCylinders}</strong> LPG Cyl</div>
                    <div className="popup-stat"><strong>{dealer.waitingDays}d</strong> Wait</div>
                    <div className="popup-stat"><strong>{dealer.queueLength}</strong> In Queue</div>
                  </div>
                </div>
              </Popup>
            </CircleMarker>
          ))}
        </MapContainer>
      </div>

      {/* Cluster Summary Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: '16px', marginTop: '24px' }}>
        {Object.values(clusterSummary).map(c => (
          <div
            key={c.key}
            className="glass-card"
            style={{
              padding: '16px',
              cursor: 'pointer',
              border: selectedCluster === c.key ? '1px solid var(--primary)' : '1px solid var(--glass-border)',
            }}
            onClick={() => setSelectedCluster(selectedCluster === c.key ? null : c.key)}
          >
            <div style={{ fontWeight: 700, fontSize: '15px', marginBottom: '8px' }}>
              📍 {c.name}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              {c.state} • {formatNumber(c.employees)} workers
            </div>
            <div className="risk-dots">
              <div className="risk-dot red">{c.red}</div>
              <div className="risk-dot yellow">{c.yellow}</div>
              <div className="risk-dot green">{c.green}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
