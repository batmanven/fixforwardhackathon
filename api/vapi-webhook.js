import { createClient } from '@supabase/supabase-js';
import { sendSMS } from './twilioService.js';

const supabase = createClient(
  import.meta.env.SUPABASE_URL || '',
  import.meta.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export default async (req, res) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const payload = req.body;
  const { call, message } = payload;

  if (message?.type === 'end-of-call-report' || payload.type === 'call-end') {
    const analysis = message?.analysis || call?.analysis;
    const structuredData = analysis?.structuredData;

    if (!structuredData) {
      return res.status(200).json({ status: 'ignored', reason: 'no_data' });
    }

    const registration = {
      owner_name: structuredData.ownerName || 'MSME Owner',
      unit_name: structuredData.unitName || `${structuredData.industry} Unit`,
      phone_number: call?.customer?.number || structuredData.phone || '',
      industry: structuredData.industry || 'General',
      daily_usage: parseFloat(structuredData.dailyUsage) || 0,
      current_stock: parseFloat(structuredData.currentStock) || 0,
      employees: parseInt(structuredData.employees) || 0,
      cluster: structuredData.cluster || 'Morbi',
      pin_code: structuredData.pinCode || '',
    };

    // Calculate Risk Score
    const fuelUrgency = registration.daily_usage > 0 && registration.current_stock / registration.daily_usage <= 3 ? 40 : 15;
    const empImpact = registration.employees > 100 ? 25 : 10;
    registration.fuel_score = Math.min(100, fuelUrgency + empImpact + 20); // Base 20 for crisis
    registration.risk_level = registration.fuel_score >= 70 ? 'red' : registration.fuel_score >= 40 ? 'yellow' : 'green';

    // Mock Coords
    registration.lat = 22.8173 + (Math.random() - 0.5) * 0.1;
    registration.lng = 70.8378 + (Math.random() - 0.5) * 0.1;

    // Save to Database
    const { data, error } = await supabase
      .from('msme_registrations')
      .insert([registration])
      .select()
      .single();

    if (error) {
      console.error('Supabase Error:', error);
      return res.status(500).json({ error: error.message });
    }

    // REAL TIME PEAK: Send SMS via Twilio
    if (registration.phone_number) {
      const smsBody = `[MERP] Hello ${registration.owner_name}, your unit "${registration.unit_name}" is successfully registered. Risk Level: ${registration.risk_level.toUpperCase()}. We are monitoring fuel routes for you.`;
      await sendSMS(registration.phone_number, smsBody);
    }

    return res.status(200).json({ status: 'success', data });
  }

  return res.status(200).json({ status: 'received' });
};
