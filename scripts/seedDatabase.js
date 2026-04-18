import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.VITE_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

const industries = {
  ceramics: { name: 'Ceramics', fuelType: 'LPG', avgDailyUsage: 45, icon: '🏭' },
  textiles: { name: 'Textiles', fuelType: 'Natural Gas', avgDailyUsage: 30, icon: '🧵' },
  autoParts: { name: 'Auto Parts', fuelType: 'LPG', avgDailyUsage: 35, icon: '⚙️' },
  restaurant: { name: 'Restaurant/Eatery', fuelType: 'LPG', avgDailyUsage: 8, icon: '🍽️' },
  pharma: { name: 'Pharmaceuticals', fuelType: 'Natural Gas', avgDailyUsage: 55, icon: '💊' },
  food: { name: 'Food Processing', fuelType: 'LPG', avgDailyUsage: 20, icon: '🥫' },
};

const clusters = {
  morbi: { name: 'Morbi', lat: 22.8173, lng: 70.8378, pinCode: '363641' },
  bhiwandi: { name: 'Bhiwandi', lat: 19.2813, lng: 73.0482, pinCode: '421302' },
  ludhiana: { name: 'Ludhiana', lat: 30.9010, lng: 75.8573, pinCode: '141001' },
};

function randomBetween(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function randomFloat(min, max, decimals = 1) { return parseFloat((Math.random() * (max - min) + min).toFixed(decimals)); }

async function seedMSMEs() {
  console.log('🌱 Seeding MSME Registrations...');
  const msmes = [];
  const keys = Object.keys(clusters);
  const indKeys = Object.keys(industries);

  for (let i = 1; i <= 50; i++) {
    const cKey = keys[i % keys.length];
    const iKey = indKeys[i % indKeys.length];
    const cluster = clusters[cKey];
    const dailyUsage = randomBetween(10, 60);
    const currentStock = randomBetween(0, dailyUsage * 8);
    const fuelScore = (currentStock / dailyUsage <= 3) ? 80 : 30;

    msmes.push({
      owner_name: `Owner ${i}`,
      unit_name: `${industries[iKey].name} Unit ${i}`,
      phone: `+9111223344${i.toString().padStart(2, '0')}`,
      industry: iKey,
      daily_usage: dailyUsage,
      current_stock: currentStock,
      employees: randomBetween(20, 200),
      fuel_score: fuelScore,
      risk_level: fuelScore >= 70 ? 'red' : 'green',
      lat: cluster.lat + randomFloat(-0.05, 0.05),
      lng: cluster.lng + randomFloat(-0.05, 0.05),
      cluster: cluster.name,
      pin_code: cluster.pinCode
    });
  }

  const { error } = await supabase.from('msme_registrations').insert(msmes);
  if (error) console.error('❌ Error seeding MSMEs:', error.message);
  else console.log('✅ Successfully seeded 50 MSMEs.');
}

async function seedDealers() {
  console.log('🌱 Seeding Fuel Dealers...');
  const dealers = [];
  const companies = ['IndianOil', 'BPCL', 'HPCL'];

  for (let i = 1; i <= 22; i++) {
    const cluster = clusters[Object.keys(clusters)[i % Object.keys(clusters).length]];
    const stockPct = randomBetween(5, 100);
    dealers.push({
      name: `${companies[i % 3]} ${cluster.name} Station ${i}`,
      company: companies[i % 3],
      lat: cluster.lat + randomFloat(-0.1, 0.1),
      lng: cluster.lng + randomFloat(-0.1, 0.1),
      city: cluster.name,
      pin_code: cluster.pinCode,
      stock_pct: stockPct,
      status: stockPct <= 15 ? 'critical' : stockPct <= 40 ? 'low' : 'available',
      accepts_voucher: true
    });
  }

  const { error } = await supabase.from('fuel_dealers').insert(dealers);
  if (error) console.error('❌ Error seeding Dealers:', error.message);
  else console.log('✅ Successfully seeded 22 Dealers.');
}

async function main() {
  await seedMSMEs();
  await seedDealers();
  console.log('✨ Seeding Completed!');
}

main();
