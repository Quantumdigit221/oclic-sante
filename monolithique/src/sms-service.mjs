// =============================================
// O'CLIC SANTE - Service SMS (Africa's Talking / Twilio / Log)
// =============================================
// Configure via .env:
//   SMS_PROVIDER=africastalking   (or 'twilio' or 'log')
//   AT_API_KEY=your_africastalking_api_key
//   AT_USERNAME=your_at_username
//   AT_SENDER_ID=OCLICSANTE
//   TWILIO_ACCOUNT_SID=...
//   TWILIO_AUTH_TOKEN=...
//   TWILIO_FROM_NUMBER=+1234567890
//   WHATSAPP_API_KEY=your_callmebot_api_key
//   WHATSAPP_PHONE=your_recipient_phone_for_test (Optional override)

import dotenv from 'dotenv';
dotenv.config();

const provider = (process.env.SMS_PROVIDER || 'log').toLowerCase();
const whatsappApiKey = process.env.WHATSAPP_API_KEY || '';

// ---- Africa's Talking ----
async function sendAfricasTalking(to, message) {
  const apiKey = process.env.AT_API_KEY || '';
  const username = process.env.AT_USERNAME || 'sandbox';
  const senderId = process.env.AT_SENDER_ID || '';

  if (!apiKey) {
    console.warn('[SMS] Africa\'s Talking: AT_API_KEY manquant → utilisation du mode LOG');
    return logSms(to, message);
  }

  const body = new URLSearchParams({
    username,
    to,
    message,
    ...(senderId ? { from: senderId } : {})
  });

  const res = await fetch('https://api.africastalking.com/version1/messaging', {
    method: 'POST',
    headers: {
      'apiKey': apiKey,
      'Content-Type': 'application/x-www-form-urlencoded',
      'Accept': 'application/json'
    },
    body: body.toString()
  });

  const rawText = await res.text();
  let json;
  try { json = JSON.parse(rawText); } catch {
    console.error('[SMS] Africa\'s Talking réponse non-JSON (status ' + res.status + '):', rawText.slice(0, 400));
    throw new Error('Africa\'s Talking: réponse inattendue (status ' + res.status + '): ' + rawText.slice(0, 200));
  }

  if (!res.ok || json?.SMSMessageData?.Recipients?.[0]?.status !== 'Success') {
    console.error('[SMS] Africa\'s Talking error:', JSON.stringify(json));
    throw new Error('SMS Afrika\'s Talking échoué: ' + JSON.stringify(json?.SMSMessageData));
  }
  console.log(`[SMS] ✅ Envoyé via Africa's Talking → ${to}`);
  return { success: true, provider: 'africastalking', to, messageId: json?.SMSMessageData?.Recipients?.[0]?.messageId };
}

// ---- Twilio ----
async function sendTwilio(to, message) {
  const accountSid = process.env.TWILIO_ACCOUNT_SID || '';
  const authToken = process.env.TWILIO_AUTH_TOKEN || '';
  const from = process.env.TWILIO_FROM_NUMBER || '';

  if (!accountSid || !authToken || !from) {
    console.warn('[SMS] Twilio: variables manquantes → utilisation du mode LOG');
    return logSms(to, message);
  }

  const auth = Buffer.from(`${accountSid}:${authToken}`).toString('base64');
  const body = new URLSearchParams({ To: to, From: from, Body: message });

  const res = await fetch(`https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`, {
    method: 'POST',
    headers: { 'Authorization': `Basic ${auth}`, 'Content-Type': 'application/x-www-form-urlencoded' },
    body: body.toString()
  });

  const json = await res.json();
  if (!res.ok || json.error_code) {
    console.error('[SMS] Twilio error:', json);
    throw new Error('SMS Twilio échoué: ' + json.message);
  }
  console.log(`[SMS] ✅ Envoyé via Twilio → ${to} (SID: ${json.sid})`);
  return { success: true, provider: 'twilio', to, messageId: json.sid };
}

// ---- WhatsApp (CallMeBot - FREE Trial) ----
async function sendWhatsAppCallMeBot(to, message) {
  if (!whatsappApiKey) {
    console.warn('[SMS] WhatsApp: WHATSAPP_API_KEY manquant → utilisation du mode LOG');
    return logSms(to, message);
  }

  // Nettoyage du numéro pour CallMeBot (format international sans le +)
  const phone = to.replace('+', '');
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encodeURIComponent(message)}&apikey=${whatsappApiKey}`;

  try {
    const res = await fetch(url);
    const text = await res.text();
    if (!res.ok || text.toLowerCase().includes('error')) {
      console.error('[SMS] WhatsApp CallMeBot error:', text);
      throw new Error('WhatsApp CallMeBot échoué: ' + text);
    }
    console.log(`[SMS] ✅ Envoyé via WhatsApp (CallMeBot) → ${to}`);
    return { success: true, provider: 'whatsapp', to, messageId: `wa-${Date.now()}` };
  } catch (err) {
    console.error('[SMS] Erreur WhatsApp (CallMeBot):', err.message);
    return logSms(to, message);
  }
}

// ---- Log (dev/fallback) ----
function logSms(to, message) {
  console.log(`\n📱 [SMS LOG] ─────────────────────────────`);
  console.log(`   Destinataire : ${to}`);
  console.log(`   Message      : ${message}`);
  console.log(`───────────────────────────────────────\n`);
  return { success: true, provider: 'log', to, messageId: `log-${Date.now()}` };
}

// ---- Normalisation numéro (Sénégal → international) ----
function normalizePhone(phone) {
  if (!phone) return null;
  let p = String(phone).replace(/\s+/g, '').replace(/[-().]/g, '');
  // Sénégal: 7X XXX XX XX → +221 7X XXX XX XX
  if (/^[0-9]{9}$/.test(p)) p = '+221' + p;
  // Déjà en format 221XXXXXXXXX
  if (/^221[0-9]{9}$/.test(p)) p = '+' + p;
  // Déjà avec +
  if (!p.startsWith('+')) p = '+' + p;
  return p;
}

// ---- API Publique ----
export async function sendSms(phone, message) {
  const to = normalizePhone(phone);
  if (!to) throw new Error('Numéro de téléphone invalide: ' + phone);
  
  try {
    let result;
    switch (provider) {
      case 'africastalking': result = await sendAfricasTalking(to, message); break;
      case 'twilio': result = await sendTwilio(to, message); break;
      case 'whatsapp': 
      case 'whatsapp-callmebot': result = await sendWhatsAppCallMeBot(to, message); break;
      default: result = logSms(to, message);
    }
    return result; // { success, provider, to, messageId }
  } catch (err) {
    console.error('[SMS] Erreur envoi, fallback log:', err.message);
    // On ne crash pas le serveur si le SMS échoue
    return { success: false, provider, to, error: err.message };
  }
}

export function buildConfirmationMessage(center, appointment) {
  const date = appointment.appointmentDate;
  const time = appointment.appointmentTime;
  const centerName = (center?.name || "O'CLIC SANTE").toUpperCase();
  return `${centerName}: Votre RDV est confirmé le ${date} à ${time}. Service: ${appointment.serviceName}. Médecin: ${appointment.doctorName || 'Non défini'}. Pour annuler appelez ${center?.phone || ''}`;
}

export function buildReminderMessage(center, appointment) {
  const date = appointment.appointmentDate;
  const time = appointment.appointmentTime;
  const centerName = (center?.name || "O'CLIC SANTE").toUpperCase();
  return `RAPPEL ${centerName}: Vous avez un RDV DEMAIN le ${date} à ${time}. Service: ${appointment.serviceName}. Médecin: ${appointment.doctorName || 'Non défini'}. Pour annuler: ${center?.phone || ''}`;
}
