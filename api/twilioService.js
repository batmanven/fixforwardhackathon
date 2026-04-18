import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = (typeof import.meta !== 'undefined' && import.meta.env?.TWILIO_ACCOUNT_SID) || import.meta.env.TWILIO_ACCOUNT_SID;
const authToken = (typeof import.meta !== 'undefined' && import.meta.env?.TWILIO_AUTH_TOKEN) || import.meta.env.TWILIO_AUTH_TOKEN;
const fromNumber = (typeof import.meta !== 'undefined' && import.meta.env?.TWILIO_PHONE_NUMBER) || import.meta.env.TWILIO_PHONE_NUMBER;

const client = (accountSid && authToken) ? twilio(accountSid, authToken) : null;

export async function sendSMS(to, body) {
  if (!client) {
    console.warn('⚠️ Twilio client not initialized. Check your environment variables.');
    return { status: 'mocked', body };
  }

  try {
    const message = await client.messages.create({
      body,
      from: fromNumber,
      to
    });
    console.log(`SMS sent to ${to}. SID: ${message.sid}`);
    return message;
  } catch (error) {
    console.error(`Failed to send SMS to ${to}:`, error.message);
    throw error;
  }
}
