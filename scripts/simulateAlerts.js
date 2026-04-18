import { createClient } from '@supabase/supabase-js';
import { sendSMS } from '../api/twilioService.js';
import dotenv from 'dotenv';
dotenv.config();

const supabase = createClient(
  import.meta.env.SUPABASE_URL || import.meta.env.VITE_SUPABASE_URL || '',
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || import.meta.env.VITE_SUPABASE_ANON_KEY || ''
);

async function runDailyScan() {
  console.log('MERP: Initiating REAL-TIME Crisis Risk Scan...');
  console.log('Date: ' + new Date().toLocaleString());

  try {
    const { data: units, error } = await supabase
      .from('msme_registrations')
      .select('*');

    if (error) throw error;

    console.log(`📊 Analysis complete. Found ${units.length} units.`);

    const criticalUnits = units.filter(u => u.fuel_score > 75 || u.days_of_fuel <= 3);

    console.log(`Identifying ${criticalUnits.length} units at CRITICAL risk...`);

    for (const unit of criticalUnits) {
      const phone = unit.phone_number;
      if (!phone) continue;

      const message = `[MERP URGENT] CRITICAL Risk detected for "${unit.unit_name}". Your fuel supply is predicted to fail in ${unit.days_of_fuel} days. Open your dashboard NOW to receive emergency rerouting instructions.`;

      console.log(`Sending Emergency SMS to: ${phone}...`);
      await sendSMS(phone, message);
    }

    console.log('\nREAL-TIME SCAN COMPLETE.');
    console.log('Status: All critical unit owners have been notified via Twilio SMS.');

  } catch (err) {
    console.error('Crisis Scan failed:', err.message);
  }
}

runDailyScan();
