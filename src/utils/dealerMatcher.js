// Dealer matching algorithm — finds nearest dealers with available stock

import { dealerList } from '../data/dealerData';

// Haversine distance calculation in km
function haversineDistance(lat1, lng1, lat2, lng2) {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLng = ((lng2 - lng1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
    Math.cos((lat2 * Math.PI) / 180) *
    Math.sin(dLng / 2) *
    Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return parseFloat((R * c).toFixed(1));
}

// Find dealers within radius that have stock
export function findNearbyDealers(msmeLat, msmeLng, radiusKm = 50, fuelType = 'LPG') {
  return dealerList
    .map(dealer => ({
      ...dealer,
      distance: haversineDistance(msmeLat, msmeLng, dealer.lat, dealer.lng),
    }))
    .filter(d => d.distance <= radiusKm)
    .filter(d => {
      if (fuelType === 'LPG') return d.lpgCylinders > 0;
      if (fuelType === 'Natural Gas') return d.naturalGasUnits > 0;
      return d.stockPct > 0;
    })
    .sort((a, b) => {
      // Sort by availability first, then distance
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (b.status === 'available' && a.status !== 'available') return 1;
      return a.distance - b.distance;
    });
}

// Generate a unique emergency voucher
export function generateVoucher(msme, dealer) {
  const voucherId = `V-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const now = new Date('2026-03-11T20:00:00');
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  return {
    voucherId,
    msmeId: msme.id,
    msmeName: msme.unitName,
    ownerName: msme.ownerName,
    dealerId: dealer.id,
    dealerName: dealer.name,
    dealerCompany: dealer.company,
    fuelType: msme.fuelType,
    quantity: msme.fuelType === 'LPG' ? `${Math.min(5, dealer.lpgCylinders)} cylinders` : `${Math.min(100, dealer.naturalGasUnits)} units`,
    issuedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    status: 'GENERATED',
    distance: dealer.distance,
    qrData: JSON.stringify({
      v: voucherId,
      m: msme.id,
      d: dealer.id,
      f: msme.fuelType,
      exp: expiry.toISOString(),
    }),
  };
}
