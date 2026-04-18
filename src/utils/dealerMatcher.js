import { supabase } from './supabaseClient';
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

// Find dealers within radius that have stock from a dynamic list
export function findNearbyDealers(msmeLat, msmeLng, radiusKm = 50, fuelType = 'LPG', customDealerList = []) {
  const sourceList = customDealerList.length > 0 ? customDealerList : dealerList;
  
  return sourceList
    .map(dealer => ({
      ...dealer,
      distance: haversineDistance(msmeLat, msmeLng, dealer.lat, dealer.lng),
    }))
    .filter(d => d.distance <= radiusKm)
    .filter(d => {
      if (fuelType === 'Natural Gas') return (d.naturalGasUnits > 0 || d.stockPct > 0);
      return d.stockPct > 10; // Simple stock check
    })
    .sort((a, b) => {
      if (a.status === 'available' && b.status !== 'available') return -1;
      if (b.status === 'available' && a.status !== 'available') return 1;
      return a.distance - b.distance;
    });
}

// Generate and persist a unique emergency voucher
export async function generateVoucher(msme, dealer) {
  const voucherId = `V-${Date.now()}-${Math.random().toString(36).substr(2, 6).toUpperCase()}`;
  const now = new Date();
  const expiry = new Date(now.getTime() + 24 * 60 * 60 * 1000);

  const voucher = {
    voucherId,
    msmeId: msme.id,
    msmeName: msme.unitName,
    ownerName: msme.ownerName,
    dealerId: dealer.id,
    dealerName: dealer.name,
    dealerCompany: dealer.company,
    fuelType: msme.fuelType || 'LPG',
    quantity: msme.fuelType === 'Natural Gas' ? '50 units' : '5 cylinders',
    issuedAt: now.toISOString(),
    expiresAt: expiry.toISOString(),
    status: 'GENERATED',
    distance: dealer.distance,
    qrData: JSON.stringify({ v: voucherId, m: msme.id, d: dealer.id, exp: expiry.toISOString() }),
  };

  // Try to save to Supabase if configured
  try {
    const { error } = await supabase
      .from('fuel_vouchers')
      .insert([{
        msme_id: msme.id.includes('-') ? msme.id : null, // UUID check
        dealer_id: dealer.id.includes('-') ? dealer.id : null,
        voucher_code: voucherId,
        amount_kg: 50,
      }]);
    if (error) console.warn('Supabase voucher save error (using local only):', error.message);
  } catch (e) {
    console.warn('Voucher persistence failed:', e);
  }

  return voucher;
}
