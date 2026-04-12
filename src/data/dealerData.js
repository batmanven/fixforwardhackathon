// Fuel dealer data across India's crisis clusters
// Simulates IndianOil, BPCL, HPCL dealer networks

const omcCompanies = ['IndianOil', 'BPCL', 'HPCL'];

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 4) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateDealer(id, baseLat, baseLng, city, state, pinPrefix) {
  const company = omcCompanies[Math.floor(Math.random() * omcCompanies.length)];
  const stockPct = randomBetween(0, 100);
  let status = 'available';
  if (stockPct <= 10) status = 'empty';
  else if (stockPct <= 30) status = 'critical';
  else if (stockPct <= 60) status = 'low';

  const lpgCylinders = randomBetween(0, 200);
  const naturalGasUnits = randomBetween(0, 500);
  const lastRefillDate = `2026-03-${String(randomBetween(1, 11)).padStart(2, '0')}`;
  const nextExpectedRefill = `2026-03-${String(randomBetween(12, 25)).padStart(2, '0')}`;

  return {
    id: `DLR-${String(id).padStart(4, '0')}`,
    name: `${company} ${city} Dealer ${id}`,
    company,
    lat: baseLat + randomFloat(-0.15, 0.15),
    lng: baseLng + randomFloat(-0.15, 0.15),
    city,
    state,
    pinCode: `${pinPrefix}${randomBetween(100, 999)}`,
    stockPct,
    status,
    lpgCylinders,
    naturalGasUnits,
    pricePerCylinder: randomBetween(1800, 2800),
    blackMarketPremium: status === 'empty' || status === 'critical' ? randomBetween(150, 300) : 0,
    lastRefillDate,
    nextExpectedRefill,
    waitingDays: status === 'empty' ? randomBetween(15, 30) : status === 'critical' ? randomBetween(8, 15) : randomBetween(1, 5),
    queueLength: randomBetween(0, 50),
    phone: `+91 ${randomBetween(70000, 99999)} ${randomBetween(10000, 99999)}`,
    isVerified: Math.random() > 0.2,
    acceptsVoucher: Math.random() > 0.3,
  };
}

let dealerId = 1;
const dealerList = [];

// Morbi area dealers
for (let i = 0; i < 12; i++) dealerList.push(generateDealer(dealerId++, 22.8173, 70.8378, 'Morbi', 'Gujarat', '363'));

// Bhiwandi area dealers
for (let i = 0; i < 10; i++) dealerList.push(generateDealer(dealerId++, 19.2813, 73.0482, 'Bhiwandi', 'Maharashtra', '421'));

// Ludhiana area dealers
for (let i = 0; i < 10; i++) dealerList.push(generateDealer(dealerId++, 30.9010, 75.8573, 'Ludhiana', 'Punjab', '141'));

// Surat area dealers
for (let i = 0; i < 8; i++) dealerList.push(generateDealer(dealerId++, 21.1702, 72.8311, 'Surat', 'Gujarat', '395'));

// Pune area dealers
for (let i = 0; i < 8; i++) dealerList.push(generateDealer(dealerId++, 18.5204, 73.8567, 'Pune', 'Maharashtra', '411'));

// Ahmedabad area dealers
for (let i = 0; i < 8; i++) dealerList.push(generateDealer(dealerId++, 23.0225, 72.5714, 'Ahmedabad', 'Gujarat', '380'));

// Delhi-NCR area dealers
for (let i = 0; i < 12; i++) dealerList.push(generateDealer(dealerId++, 28.7041, 77.1025, 'Delhi', 'Delhi', '110'));

export const dealerStats = {
  total: dealerList.length,
  empty: dealerList.filter(d => d.status === 'empty').length,
  critical: dealerList.filter(d => d.status === 'critical').length,
  low: dealerList.filter(d => d.status === 'low').length,
  available: dealerList.filter(d => d.status === 'available').length,
  avgWaitDays: parseFloat((dealerList.reduce((s, d) => s + d.waitingDays, 0) / dealerList.length).toFixed(1)),
  avgStockPct: parseFloat((dealerList.reduce((s, d) => s + d.stockPct, 0) / dealerList.length).toFixed(1)),
  acceptingVouchers: dealerList.filter(d => d.acceptsVoucher).length,
};

export { dealerList };
export default dealerList;
