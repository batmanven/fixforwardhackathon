import { supabase } from '../utils/supabaseClient';

const omcCompanies = ['IndianOil', 'BPCL', 'HPCL'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 4) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateDealer(id, baseLat, baseLng, city, state, pinPrefix) {
  const dealerNames = {
    IndianOil: ['Nilkanth Petro Club', 'Rameshwar Petroleum', 'Nirmal Jyoti Energy', 'Kisan Seva Kendra'],
    BPCL: ['Highway Point Service', 'Morbi Fuel Hub', 'Vajepar Filling Station', 'Main Road BP'],
    HPCL: ['Dharmjeet Petroleum', 'Siddhivinayak Fuel', 'Gajanan Petro', 'Industrial Area HP']
  };

  const company = omcCompanies[id % 3];
  const stockPct = randomBetween(0, 100);
  let status = 'available';
  if (stockPct <= 10) status = 'empty';
  else if (stockPct <= 30) status = 'critical';
  else if (stockPct <= 60) status = 'low';

  const name = dealerNames[company][id % 4];

  return {
    id: `DLR-${String(id).padStart(4, '0')}`,
    name: name,
    company,
    lat: baseLat + randomFloat(-0.08, 0.08),
    lng: baseLng + randomFloat(-0.08, 0.08),
    city,
    state,
    pinCode: `${pinPrefix}${randomBetween(100, 999)}`,
    stockPct,
    status,
    lpgCylinders: randomBetween(10, 200),
    waitingDays: status === 'empty' ? 20 : 2,
    queueLength: randomBetween(0, 50),
    phone: `+91 99XXX XXX${String(id).padStart(2, '0')}`,
    acceptsVoucher: true,
  };
}

// Static fallback list
export const dealerList = [
  ...Array.from({ length: 12 }, (_, i) => generateDealer(i + 1, 22.8173, 70.8378, 'Morbi', 'Gujarat', '363')),
  ...Array.from({ length: 10 }, (_, i) => generateDealer(i + 13, 19.2813, 73.0482, 'Bhiwandi', 'Maharashtra', '421')),
];

export const calculateDealerStats = (list) => {
  if (!list || list.length === 0) {
    return {
      total: 0,
      empty: 0,
      critical: 0,
      low: 0,
      available: 0,
      avgWaitDays: 0,
      avgStockPct: 0,
      acceptingVouchers: 0,
    };
  }
  return {
    total: list.length,
    empty: list.filter(d => d.status === 'empty').length,
    critical: list.filter(d => d.status === 'critical').length,
    low: list.filter(d => d.status === 'low').length,
    available: list.filter(d => d.status === 'available').length,
    avgWaitDays: parseFloat((list.reduce((s, d) => s + d.waitingDays, 0) / list.length).toFixed(1)),
    avgStockPct: parseFloat((list.reduce((s, d) => s + d.stockPct, 0) / list.length).toFixed(1)),
    acceptingVouchers: list.filter(d => d.acceptsVoucher).length,
  };
};

export const dealerStats = calculateDealerStats(dealerList);

/**
 * Fetch live Dealers from Supabase
 */
export async function getLiveDealers() {
  try {
    const { data, error } = await supabase
      .from('fuel_dealers')
      .select('*');

    if (error) throw error;
    if (!data || data.length === 0) return [];

    return data.map(d => ({
      ...d,
      stockPct: d.stock_pct,
      pinCode: d.pin_code,
      acceptsVoucher: d.accepts_voucher,
      waitingDays: d.status === 'empty' ? 15 : 2,
    }));
  } catch (err) {
    console.error('Supabase fetch failed for dealers, returning empty state:', err);
    return [];
  }
}

export default dealerList;
