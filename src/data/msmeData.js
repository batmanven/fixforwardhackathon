// Realistic MSME data based on the crisis situation
// 250+ units across Morbi (ceramics), Bhiwandi (textiles), Ludhiana (auto parts), Restaurants

const industries = {
  ceramics: { name: 'Ceramics', fuelType: 'LPG', avgDailyUsage: 45, icon: '🏭' },
  textiles: { name: 'Textiles', fuelType: 'Natural Gas', avgDailyUsage: 30, icon: '🧵' },
  autoParts: { name: 'Auto Parts', fuelType: 'LPG', avgDailyUsage: 35, icon: '⚙️' },
  restaurant: { name: 'Restaurant/Eatery', fuelType: 'LPG', avgDailyUsage: 8, icon: '🍽️' },
  pharma: { name: 'Pharmaceuticals', fuelType: 'Natural Gas', avgDailyUsage: 55, icon: '💊' },
  food: { name: 'Food Processing', fuelType: 'LPG', avgDailyUsage: 20, icon: '🥫' },
};

const clusters = {
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

const firstNames = [
  'Rajesh', 'Amit', 'Suresh', 'Mahesh', 'Dinesh', 'Ramesh', 'Vikram', 'Arun',
  'Prakash', 'Sanjay', 'Jitendra', 'Bhavesh', 'Nilesh', 'Kiran', 'Gopal',
  'Mohan', 'Ravi', 'Deepak', 'Mukesh', 'Naresh', 'Harish', 'Ashok', 'Vinod',
  'Pramod', 'Kamlesh', 'Jagdish', 'Manoj', 'Paresh', 'Hitesh', 'Yogesh',
  'Fatima', 'Rekha', 'Sunita', 'Meena', 'Geeta', 'Savita',
];

const lastNames = [
  'Patel', 'Shah', 'Sharma', 'Kumar', 'Singh', 'Desai', 'Mehta', 'Joshi',
  'Agarwal', 'Gupta', 'Verma', 'Chauhan', 'Thakkar', 'Modi', 'Parikh',
  'Bhatt', 'Pandey', 'Yadav', 'Reddy', 'Nair', 'Iyer',
];

const ceramicProducts = ['Wall Tiles', 'Floor Tiles', 'Vitrified Tiles', 'Sanitary Ware', 'Roof Tiles'];
const textileProducts = ['Cotton Fabric', 'Synthetic Fabric', 'Denim', 'Silk Blend', 'Power Loom Fabric'];
const autoProducts = ['Bicycle Parts', 'Sewing Machine Parts', 'Engine Components', 'Fasteners', 'Hand Tools'];
const restaurantTypes = ['Dhaba', 'Restaurant', 'Street Food Stall', 'Catering Service', 'Bakery'];
const pharmaProducts = ['API Manufacturing', 'Tablet Formulation', 'Syrup Manufacturing', 'Bulk Drug'];
const foodProducts = ['Spice Processing', 'Oil Milling', 'Flour Milling', 'Snack Manufacturing'];

function getProducts(industry) {
  switch (industry) {
    case 'ceramics': return ceramicProducts;
    case 'textiles': return textileProducts;
    case 'autoParts': return autoProducts;
    case 'restaurant': return restaurantTypes;
    case 'pharma': return pharmaProducts;
    case 'food': return foodProducts;
    default: return ['General Manufacturing'];
  }
}

function randomBetween(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function randomFloat(min, max, decimals = 1) {
  return parseFloat((Math.random() * (max - min) + min).toFixed(decimals));
}

function generateMSME(id, clusterKey, industryKey) {
  const cluster = clusters[clusterKey];
  const industry = industries[industryKey];
  const products = getProducts(industryKey);

  const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
  const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
  const product = products[Math.floor(Math.random() * products.length)];

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

  // Fuel Dependency Score: higher = more critical
  // Based on: days of fuel remaining, employees, export orders, capacity
  let fuelScore = 0;
  if (daysOfFuel <= 1) fuelScore += 40;
  else if (daysOfFuel <= 3) fuelScore += 30;
  else if (daysOfFuel <= 5) fuelScore += 20;
  else if (daysOfFuel <= 7) fuelScore += 10;
  else fuelScore += 5;

  if (employees > 200) fuelScore += 20;
  else if (employees > 50) fuelScore += 15;
  else fuelScore += 8;

  if (hasExportOrders) fuelScore += 15;
  if (capacityUtilization < 40) fuelScore += 15;
  else if (capacityUtilization < 60) fuelScore += 10;

  fuelScore = Math.min(100, Math.max(1, fuelScore + randomBetween(-5, 5)));

  let riskLevel = 'green';
  if (fuelScore >= 70) riskLevel = 'red';
  else if (fuelScore >= 40) riskLevel = 'yellow';

  // Add slight random offset to cluster coordinates
  const lat = cluster.lat + randomFloat(-0.08, 0.08, 4);
  const lng = cluster.lng + randomFloat(-0.08, 0.08, 4);

  const registrationDate = new Date(2026, 2, randomBetween(1, 10));
  const phone = `+91 ${randomBetween(70000, 99999)} ${randomBetween(10000, 99999)}`;

  return {
    id: `MERP-${String(id).padStart(5, '0')}`,
    ownerName: `${firstName} ${lastName}`,
    unitName: `${lastName} ${product}${industryKey === 'restaurant' ? '' : ' Works'}`,
    phone,
    industry: industryKey,
    industryLabel: industry.name,
    industryIcon: industry.icon,
    product,
    fuelType: industry.fuelType,
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
    lat,
    lng,
    registrationDate: registrationDate.toISOString().split('T')[0],
    lastUpdated: '2026-03-11',
    language: clusterKey === 'morbi' || clusterKey === 'surat' || clusterKey === 'ahmedabad'
      ? 'Gujarati'
      : clusterKey === 'bhiwandi' || clusterKey === 'pune'
        ? 'Marathi'
        : clusterKey === 'ludhiana'
          ? 'Punjabi'
          : 'Hindi',
  };
}

// Generate 280 MSMEs across clusters
let msmeId = 1;
const msmeList = [];

// Morbi - 60 ceramic units
for (let i = 0; i < 55; i++) msmeList.push(generateMSME(msmeId++, 'morbi', 'ceramics'));
for (let i = 0; i < 5; i++) msmeList.push(generateMSME(msmeId++, 'morbi', 'food'));

// Bhiwandi - 50 textile units
for (let i = 0; i < 45; i++) msmeList.push(generateMSME(msmeId++, 'bhiwandi', 'textiles'));
for (let i = 0; i < 5; i++) msmeList.push(generateMSME(msmeId++, 'bhiwandi', 'restaurant'));

// Ludhiana - 40 auto parts
for (let i = 0; i < 35; i++) msmeList.push(generateMSME(msmeId++, 'ludhiana', 'autoParts'));
for (let i = 0; i < 5; i++) msmeList.push(generateMSME(msmeId++, 'ludhiana', 'food'));

// Surat - 30 textiles
for (let i = 0; i < 25; i++) msmeList.push(generateMSME(msmeId++, 'surat', 'textiles'));
for (let i = 0; i < 5; i++) msmeList.push(generateMSME(msmeId++, 'surat', 'restaurant'));

// Pune - 30 restaurants + pharma
for (let i = 0; i < 20; i++) msmeList.push(generateMSME(msmeId++, 'pune', 'restaurant'));
for (let i = 0; i < 10; i++) msmeList.push(generateMSME(msmeId++, 'pune', 'pharma'));

// Ahmedabad - 30 pharma + food
for (let i = 0; i < 15; i++) msmeList.push(generateMSME(msmeId++, 'ahmedabad', 'pharma'));
for (let i = 0; i < 15; i++) msmeList.push(generateMSME(msmeId++, 'ahmedabad', 'food'));

// Delhi-NCR - 40 restaurants + food
for (let i = 0; i < 30; i++) msmeList.push(generateMSME(msmeId++, 'delhiNCR', 'restaurant'));
for (let i = 0; i < 10; i++) msmeList.push(generateMSME(msmeId++, 'delhiNCR', 'food'));

// Summary statistics
export const stats = {
  totalMSMEs: msmeList.length,
  redUnits: msmeList.filter(m => m.riskLevel === 'red').length,
  yellowUnits: msmeList.filter(m => m.riskLevel === 'yellow').length,
  greenUnits: msmeList.filter(m => m.riskLevel === 'green').length,
  totalEmployees: msmeList.reduce((s, m) => s + m.employees, 0),
  avgCapacity: parseFloat((msmeList.reduce((s, m) => s + m.capacityUtilization, 0) / msmeList.length).toFixed(1)),
  exportAtRisk: msmeList.filter(m => m.hasExportOrders && m.riskLevel === 'red').reduce((s, m) => s + m.exportValueLakhs, 0),
  avgFuelDays: parseFloat((msmeList.reduce((s, m) => s + m.daysOfFuel, 0) / msmeList.length).toFixed(1)),
  noFuelBuffer: msmeList.filter(m => m.daysOfFuel <= 7).length,
  criticalUnits: msmeList.filter(m => m.daysOfFuel <= 2).length,
};

export { msmeList, industries, clusters };
export default msmeList;
