// Fuel Dependency Score calculation algorithm
// Score ranges from 1 (low risk) to 100 (critical - shutdown in 3 days)

export function calculateFuelScore({
  dailyUsageKg,
  currentStockKg,
  employees,
  hasExportOrders,
  capacityUtilization,
  industryMultiplier = 1,
}) {
  const daysOfFuel = currentStockKg > 0 ? currentStockKg / dailyUsageKg : 0;

  // Component 1: Fuel urgency (0-40 points)
  let fuelUrgency = 0;
  if (daysOfFuel <= 1) fuelUrgency = 40;
  else if (daysOfFuel <= 2) fuelUrgency = 35;
  else if (daysOfFuel <= 3) fuelUrgency = 30;
  else if (daysOfFuel <= 5) fuelUrgency = 20;
  else if (daysOfFuel <= 7) fuelUrgency = 10;
  else fuelUrgency = 5;

  // Component 2: Employment impact (0-25 points)
  let empImpact = 0;
  if (employees > 200) empImpact = 25;
  else if (employees > 100) empImpact = 20;
  else if (employees > 50) empImpact = 15;
  else if (employees > 20) empImpact = 10;
  else empImpact = 5;

  // Component 3: Export dependency (0-15 points)
  const exportScore = hasExportOrders ? 15 : 0;

  // Component 4: Capacity stress (0-15 points)
  let capacityScore = 0;
  if (capacityUtilization < 20) capacityScore = 15;
  else if (capacityUtilization < 40) capacityScore = 12;
  else if (capacityUtilization < 60) capacityScore = 8;
  else capacityScore = 3;

  // Component 5: Industry multiplier (0.8 - 1.2x)
  const totalRaw = fuelUrgency + empImpact + exportScore + capacityScore;
  const total = Math.round(totalRaw * industryMultiplier);

  return {
    score: Math.min(100, Math.max(1, total)),
    daysOfFuel: parseFloat(daysOfFuel.toFixed(1)),
    riskLevel: total >= 70 ? 'red' : total >= 40 ? 'yellow' : 'green',
    breakdown: {
      fuelUrgency,
      empImpact,
      exportScore,
      capacityScore,
    },
  };
}

export function getRiskColor(level) {
  switch (level) {
    case 'red': return '#EF4444';
    case 'yellow': return '#F59E0B';
    case 'green': return '#22C55E';
    default: return '#6B7280';
  }
}

export function getRiskLabel(level) {
  switch (level) {
    case 'red': return 'CRITICAL';
    case 'yellow': return 'WARNING';
    case 'green': return 'STABLE';
    default: return 'UNKNOWN';
  }
}
