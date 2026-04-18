// Predictive alert data for MERP shutdown predictions
import { msmeList } from './msmeData';

// Generate alerts for units with <= 5 days of fuel
export function generateAlerts(inputList = msmeList) {
  const now = new Date('2026-03-11T20:00:00');

  return inputList
    .filter(m => m.daysOfFuel <= 5)
    .map((msme, index) => ({
      id: `ALT-${String(index + 1).padStart(5, '0')}`,
      msmeId: msme.id,
      ownerName: msme.ownerName,
      unitName: msme.unitName,
      phone: msme.phone,
      cluster: msme.clusterName,
      state: msme.state,
      industry: msme.industryLabel,
      industryIcon: msme.industryIcon,
      daysOfFuel: msme.daysOfFuel,
      fuelScore: msme.fuelScore,
      riskLevel: msme.riskLevel,
      employees: msme.employees,
      hasExportOrders: msme.hasExportOrders,
      exportValueLakhs: msme.exportValueLakhs,
      capacityUtilization: msme.capacityUtilization,
      timestamp: new Date(now.getTime() - index * 300000).toISOString(),
      alertType: msme.daysOfFuel <= 1 ? 'CRITICAL' : msme.daysOfFuel <= 3 ? 'HIGH' : 'WARNING',
      smsText: generateSMSText(msme),
      smsTextHindi: generateSMSTextHindi(msme),
      acknowledged: Math.random() > 0.6,
      emergencyFuelRequested: Math.random() > 0.5 && msme.daysOfFuel <= 3,
    }))
    .sort((a, b) => a.daysOfFuel - b.daysOfFuel);
}

function generateSMSText(msme) {
  if (msme.daysOfFuel <= 1) {
    return `MERP CRITICAL: ${msme.unitName} has <1 day ${msme.fuelType} left. IMMEDIATE shutdown risk. ${msme.employees} jobs at risk. Reply 1 for EMERGENCY FUEL. Reply 2 for nearby dealer.`;
  }
  if (msme.daysOfFuel <= 3) {
    return `MERP ALERT: ${msme.unitName} has ${msme.daysOfFuel} days ${msme.fuelType} left. High shutdown risk. Reply 1 for emergency fuel. Reply 2 for dealer locations.`;
  }
  return `MERP WARNING: ${msme.unitName} has ${msme.daysOfFuel} days ${msme.fuelType} remaining. Plan refill soon. Reply 1 for dealer availability.`;
}

function generateSMSTextHindi(msme) {
  if (msme.daysOfFuel <= 1) {
    return `MERP गंभीर: ${msme.unitName} में <1 दिन का ${msme.fuelType} बचा है। तुरंत बंद होने का खतरा। ${msme.employees} नौकरियां खतरे में। आपातकालीन ईंधन के लिए 1 दबाएं।`;
  }
  if (msme.daysOfFuel <= 3) {
    return `MERP चेतावनी: ${msme.unitName} में ${msme.daysOfFuel} दिन का ${msme.fuelType} बचा है। बंद होने का खतरा। आपातकालीन ईंधन के लिए 1 दबाएं।`;
  }
  return `MERP सूचना: ${msme.unitName} में ${msme.daysOfFuel} दिन का ${msme.fuelType} बचा है। रीफिल की योजना बनाएं। डीलर उपलब्धता के लिए 1 दबाएं।`;
}

// Generate district-level morning reports
export function generateDistrictReports(inputList = msmeList) {
  const clusterGroups = {};

  inputList.forEach(msme => {
    if (!clusterGroups[msme.clusterName]) {
      clusterGroups[msme.clusterName] = {
        cluster: msme.clusterName,
        state: msme.state,
        total: 0,
        red: 0,
        yellow: 0,
        green: 0,
        industries: {},
        totalEmployees: 0,
        avgCapacity: 0,
        exportAtRisk: 0,
      };
    }
    const g = clusterGroups[msme.clusterName];
    g.total++;
    g[msme.riskLevel]++;
    g.totalEmployees += msme.employees;
    g.avgCapacity += msme.capacityUtilization;
    if (msme.hasExportOrders && msme.riskLevel === 'red') {
      g.exportAtRisk += msme.exportValueLakhs;
    }
    if (!g.industries[msme.industryLabel]) g.industries[msme.industryLabel] = 0;
    g.industries[msme.industryLabel]++;
  });

  return Object.values(clusterGroups).map(g => ({
    ...g,
    avgCapacity: parseFloat((g.avgCapacity / g.total).toFixed(1)),
    industries: Object.entries(g.industries)
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count),
  })).sort((a, b) => b.red - a.red);
}

// WhatsApp-style morning report text
export function generateMorningReport(districtReport) {
  const r = districtReport;
  const industryBreakdown = r.industries
    .map(i => `${i.count} ${i.name}`)
    .join(', ');

  return `📊 *MERP Morning Report — ${r.cluster}, ${r.state}*
📅 11 March 2026 | 6:00 AM

🔴 *${r.red} units CRITICAL* (shutdown imminent)
🟡 ${r.yellow} units WARNING
🟢 ${r.green} units STABLE

📋 Industry: ${industryBreakdown}

👷 *${r.totalEmployees.toLocaleString('en-IN')} workers affected*
📊 Avg capacity: ${r.avgCapacity}%
${r.exportAtRisk > 0 ? `💰 Export orders at risk: ₹${r.exportAtRisk.toLocaleString('en-IN')} L` : ''}

⚠️ Priority: Deploy emergency fuel to RED units immediately.
📞 Contact DIC: 1800-XXX-XXXX`;
}

export const alerts = generateAlerts();
export const districtReports = generateDistrictReports();
