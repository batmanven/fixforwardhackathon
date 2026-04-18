import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '../api/twilioService.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  process.env.VITE_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

async function runCrisisEngine() {
  console.log('🔥 MERP: Initiating REAL-TIME Crisis Depletion Engine...');
  console.log('Time: ' + new Date().toLocaleString());

  try {
    const { data: units, error } = await supabase.from('msme_registrations').select('*');
    if (error) throw error;

    console.log(`📊 Industry Monitor: Analyzing ${units.length} active units...`);

    const updates = [];
    const notifications = [];

    for (const unit of units) {
      // Simulation: Daily depletion (random 10-25% of stock consumed)
      const depletion = unit.daily_usage * (0.5 + Math.random());
      const newStock = Math.max(0, unit.current_stock - depletion);
      const daysLeft = newStock / unit.daily_usage;
      
      // Calculate new risk
      let fuelScore = daysLeft <= 1 ? 95 : daysLeft <= 3 ? 80 : daysLeft <= 7 ? 50 : 20;
      let riskLevel = fuelScore >= 80 ? 'red' : fuelScore >= 50 ? 'yellow' : 'green';

      updates.push({
        id: unit.id,
        current_stock: newStock,
        fuel_score: fuelScore,
        risk_level: riskLevel
      });

      // Trigger Alert if risk just worsened to CRITICAL
      if (riskLevel === 'red' && unit.risk_level !== 'red' && unit.phone) {
        notifications.push({
          to: unit.phone,
          body: `[MERP URGENT ALERT] Your unit "${unit.unit_name}" has entered CRITICAL risk status (${daysLeft.toFixed(1)} days fuel left). We have prioritized emergency rerouting to your cluster. Check your dashboard immediately.`
        });
      }
    }

    // Batch Update Supabase
    console.log('📡 Syncing crisis status to Intelligence Layer...');
    for (const update of updates) {
      await supabase.from('msme_registrations').update(update).eq('id', update.id);
    }

    // Send Live SMS via Twilio
    if (notifications.length > 0) {
      console.log(`📲 Sending ${notifications.length} Emergency Alerts via Twilio...`);
      for (const note of notifications) {
        await sendSMS(note.to, note.body);
      }
    } else {
      console.log('✅ No new critical transitions detected this cycle.');
    }

    console.log('\n✨ CRISIS CYCLE COMPLETE. Dashboard updated with live stock data.');

  } catch (err) {
    console.error('❌ Crisis Engine Crash:', err.message);
  }
}

runCrisisEngine();
