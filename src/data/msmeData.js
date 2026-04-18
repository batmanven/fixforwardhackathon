import { supabase } from '../utils/supabaseClient';


export const industries = {
  ceramics: { name: 'Ceramics', fuelType: 'LPG', avgDailyUsage: 45, icon: '🏭' },
  textiles: { name: 'Textiles', fuelType: 'Natural Gas', avgDailyUsage: 30, icon: '🧵' },
  autoParts: { name: 'Auto Parts', fuelType: 'LPG', avgDailyUsage: 35, icon: '⚙️' },
  restaurant: { name: 'Restaurant/Eatery', fuelType: 'LPG', avgDailyUsage: 8, icon: '🍽️' },
  pharma: { name: 'Pharmaceuticals', fuelType: 'Natural Gas', avgDailyUsage: 55, icon: '💊' },
  food: { name: 'Food Processing', fuelType: 'LPG', avgDailyUsage: 20, icon: '🥫' },
};

export const clusters = {
  morbi: {
    name: 'Morbi',
    state: 'Gujarat',
    lat: 22.8173,
    lng: 70.8378,
    pinCode: '363641',
    primaryIndustry: 'ceramics',
    totalUnits: 850,
    totalWorkers: 800000,
  },
  bhiwandi: {
    name: 'Bhiwandi',
    state: 'Maharashtra',
    lat: 19.2813,
    lng: 73.0482,
    pinCode: '421302',
    primaryIndustry: 'textiles',
    totalUnits: 1200,
    totalWorkers: 1500000,
  },
  ludhiana: {
    name: 'Ludhiana',
    state: 'Punjab',
    lat: 30.9010,
    lng: 75.8573,
    pinCode: '141001',
    primaryIndustry: 'autoParts',
    totalUnits: 12000,
    totalWorkers: 500000,
  },
  surat: {
    name: 'Surat',
    state: 'Gujarat',
    lat: 21.1702,
    lng: 72.8311,
    pinCode: '395003',
    primaryIndustry: 'textiles',
    totalUnits: 600,
    totalWorkers: 400000,
  },
  pune: {
    name: 'Pune',
    state: 'Maharashtra',
    lat: 18.5204,
    lng: 73.8567,
    pinCode: '411001',
    primaryIndustry: 'restaurant',
    totalUnits: 5000,
    totalWorkers: 25000,
  },
  ahmedabad: {
    name: 'Ahmedabad',
    state: 'Gujarat',
    lat: 23.0225,
    lng: 72.5714,
    pinCode: '380001',
    primaryIndustry: 'pharma',
    totalUnits: 300,
    totalWorkers: 45000,
  },
  delhiNCR: {
    name: 'Delhi-NCR',
    state: 'Delhi',
    lat: 28.7041,
    lng: 77.1025,
    pinCode: '110001',
    primaryIndustry: 'restaurant',
    totalUnits: 8000,
    totalWorkers: 40000,
  },
};

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateMSME(id, clusterKey, industryKey) {
  const cluster = clusters[clusterKey];
  const industry = industries[industryKey];


  const dailyUsageKg = randomBetween(
    Math.floor(industry.avgDailyUsage * 0.5),
    Math.floor(industry.avgDailyUsage * 1.5)
  );
  const currentStockKg = randomBetween(0, dailyUsageKg * 10);
  const daysOfFuel = currentStockKg > 0 ? parseFloat((currentStockKg / dailyUsageKg).toFixed(1)) : 0;
  const employees = industryKey === 'restaurant'
    ? randomBetween(3, 25)
    : randomBetween(15, 500);

  const capacityUtilization = randomFloat(10, 95);
  const hasExportOrders = Math.random() > 0.6;
  const exportValueLakhs = hasExportOrders ? randomBetween(5, 500) : 0;

  let fuelScore = daysOfFuel <= 3 ? 80 : 30;
  let riskLevel = fuelScore >= 70 ? 'red' : 'green';

  return {
    id: `MERP-${String(id).padStart(5, '0')}`,
    ownerName: `Owner ${id}`,
    unitName: `Unit ${id}`,
    phone: `+91 99999 00000`,
    industry: industryKey,
    industryLabel: industry.name,
    industryIcon: industry.icon,
    dailyUsageKg,
    currentStockKg,
    daysOfFuel,
    employees,
    capacityUtilization,
    hasExportOrders,
    exportValueLakhs,
    fuelScore,
    riskLevel,
    cluster: clusterKey,
    clusterName: cluster.name,
    state: cluster.state,
    pinCode: cluster.pinCode,
    lat: cluster.lat + randomFloat(-0.05, 0.05, 4),
    lng: cluster.lng + randomFloat(-0.05, 0.05, 4),
    registrationDate: '2026-03-01',
  };
}

// Generate static list as fallback
export const msmeList = Array.from({ length: 50 }, (_, i) => generateMSME(i + 1, 'morbi', 'ceramics'));

export const calculateStats = (list) => ({
  totalMSMEs: list.length,
  redUnits: list.filter(m => m.riskLevel === 'red').length,
  yellowUnits: list.filter(m => m.riskLevel === 'yellow').length,
  greenUnits: list.filter(m => m.riskLevel === 'green').length,
  totalEmployees: list.reduce((s, m) => s + m.employees, 0),
  avgCapacity: parseFloat((list.reduce((s, m) => s + m.capacityUtilization, 0) / list.length).toFixed(1)),
  exportAtRisk: list.filter(m => m.hasExportOrders && m.riskLevel === 'red').reduce((s, m) => s + m.exportValueLakhs, 0),
  avgFuelDays: parseFloat((list.reduce((s, m) => s + m.daysOfFuel, 0) / list.length).toFixed(1)),
  criticalUnits: list.filter(m => m.daysOfFuel <= 2).length,
});

export const stats = calculateStats(msmeList);

/**
 * Fetch live MSMEs from Supabase
 */
export async function getLiveMSMEs() {
  try {
    const { data, error } = await supabase
      .from('msme_registrations')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data || data.length === 0) return msmeList;

    // Map DB fields to app fields
    return data.map(m => ({
      ...m,
      id: m.id.substring(0, 8),
      ownerName: m.owner_name,
      unitName: m.unit_name,
      dailyUsageKg: m.daily_usage,
      currentStockKg: m.current_stock,
      daysOfFuel: m.days_of_fuel,
      industryLabel: industries[m.industry]?.name || 'General',
      industryIcon: industries[m.industry]?.icon || '🏭',
      clusterName: m.cluster,
      riskLevel: m.risk_level,
      fuelScore: m.fuel_score,
      capacityUtilization: m.capacity_utilization || 40,
      hasExportOrders: m.has_export_orders || false,
      exportValueLakhs: m.export_value_lakhs || 0,
    }));
  } catch (err) {
    console.error('Supabase fetch failed, using fallback metrics:', err);
    return msmeList;
  }
}

export default msmeList;
