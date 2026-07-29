// Vercel Serverless Function — send an email via Resend (same-origin for namibiarates.com).
// Needs RESEND_API_KEY on THIS Vercel project. To email arbitrary client addresses, verify a
// sending domain in Resend and set EMAIL_FROM (e.g. "Namibia Rates <itinerary@desert-tracks.com>").
// Without a verified domain the Resend sandbox sender only delivers to the account owner's address.
module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') { res.status(204).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok:false, error:'Method not allowed' }); return; }
  try {
    let data = req.body;
    if (!data || typeof data !== 'object') {
      const raw = await new Promise((resolve)=>{ let d=''; req.on('data',c=>d+=c); req.on('end',()=>resolve(d)); req.on('error',()=>resolve('')); });
      try { data = JSON.parse(raw || '{}'); } catch(e){ data = {}; }
    }
    const to = data.to, html = data.html;
    const subject = data.subject || 'Your Namibia Itinerary';
    if (!to || !html) { res.status(200).json({ ok:false, error:'Missing "to" or "html".' }); return; }
    const key = process.env.RESEND_API_KEY;
    if (!key) { res.status(200).json({ ok:false, error:'RESEND_API_KEY env var not set on this project.' }); return; }
    const from = process.env.EMAIL_FROM || 'Namibia Rates <onboarding@resend.dev>';
    const payload = { from: from, to: Array.isArray(to)?to:[to], subject: subject, html: html };
    if (data.cc)  payload.cc  = Array.isArray(data.cc)?data.cc:[data.cc];
    if (data.bcc) payload.bcc = Array.isArray(data.bcc)?data.bcc:[data.bcc];
    if (data.reply_to || data.replyTo) payload.reply_to = data.reply_to || data.replyTo;
    const r = await fetch('https://api.resend.com/emails', {
      method:'POST', headers:{ 'Authorization':'Bearer '+key, 'Content-Type':'application/json' }, body: JSON.stringify(payload)
    });
    const bodyText = await r.text().catch(()=> '');
    let msg=''; try { const j=JSON.parse(bodyText); msg = j.message || j.error || ''; } catch(e){ msg = bodyText.slice(0,300); }
    res.status(200).json({ ok: r.ok, upstreamStatus: r.status, error: r.ok ? undefined : (msg || ('Resend '+r.status)) });
  } catch (e) {
    res.status(200).json({ ok:false, error:String(e) });
  }
};
