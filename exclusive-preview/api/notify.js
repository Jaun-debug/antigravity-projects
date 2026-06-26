// Serverless function: emails on every open of the Exclusive Reservations preview.
// Sends via Resend (https://resend.com). The API key is read from the
// RESEND_API_KEY environment variable set in the Vercel project (never hard-coded).
module.exports = async (req, res) => {
  try {
    const fwd = (req.headers['x-forwarded-for'] || '').split(',')[0].trim();
    const ip = fwd || req.socket?.remoteAddress || 'unknown';
    let loc = 'Unknown location';
    try {
      const g = await fetch('https://ipapi.co/' + ip + '/json/');
      const d = await g.json();
      loc = [d.city, d.region, d.country_name].filter(Boolean).join(', ') || loc;
    } catch (e) { /* location best-effort */ }

    const when = new Date().toLocaleString('en-GB', { timeZone: 'Africa/Windhoek' });
    const ua = req.headers['user-agent'] || '';
    const html = '<div style="font-family:Georgia,serif;color:#2C2824;padding:20px;max-width:540px;">'
      + '<h2 style="color:#a48256;font-weight:400;margin:0 0 14px;">Exclusive Reservations sheet opened</h2>'
      + '<p style="margin:4px 0;"><strong>Time:</strong> ' + when + ' (Namibia time)</p>'
      + '<p style="margin:4px 0;"><strong>Approx. location:</strong> ' + loc + '</p>'
      + '<p style="margin:4px 0;"><strong>IP:</strong> ' + ip + '</p>'
      + '<p style="margin:4px 0;"><strong>Device:</strong> ' + ua + '</p>'
      + '<p style="margin:16px 0 0;color:#999;font-size:12px;">Sent automatically each time someone opens the password-gated preview.</p></div>';

    const key = process.env.RESEND_API_KEY;
    if (!key) { res.status(200).json({ ok: false, error: 'RESEND_API_KEY env var not set' }); return; }

    const r = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer ' + key, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        from: 'Namibia Rates <onboarding@resend.dev>',
        to: ['bookings@desert-tracks.com'],
        subject: 'Exclusive Reservations sheet opened — ' + when,
        html: html
      })
    });
    const body = await r.text().catch(() => '');
    res.status(200).json({ ok: r.ok, upstreamStatus: r.status, upstreamBody: body.slice(0, 300) });
  } catch (e) {
    res.status(200).json({ ok: false, error: String(e) });
  }
};
