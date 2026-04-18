import twilio from 'twilio';
import dotenv from 'dotenv';

dotenv.config();

const accountSid = import.meta.env.TWILIO_ACCOUNT_SID;
const authToken = import.meta.env.TWILIO_AUTH_TOKEN;
const fromNumber = import.meta.env.TWILIO_PHONE_NUMBER;

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
