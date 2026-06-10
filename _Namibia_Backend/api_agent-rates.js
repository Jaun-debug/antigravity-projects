// ============================================================
// /api/agent-rates  — resolves an agent's net STO rate for a lodge.
// Deploy this to: dt_library/api/agent-rates.js  (once Supabase is set up)
//
// Env vars (Vercel → Project Settings → Environment Variables):
//   SUPABASE_URL       = https://<your-project>.supabase.co   (public)
//   SUPABASE_ANON_KEY  = <anon public key>                    (public, RLS-protected)
//
// Auth: the browser sends the logged-in agent's Supabase access token in the
// Authorization header. We create a Supabase client scoped to that token, so
// Row-Level Security guarantees the agent can only read THEIR OWN assignment.
// ============================================================
const { createClient } = require('@supabase/supabase-js');

module.exports = async (req, res) => {
  if (req.method !== 'POST') return res.status(405).json({ error: 'POST only' });

  const url = process.env.SUPABASE_URL;
  const anon = process.env.SUPABASE_ANON_KEY;
  if (!url || !anon) return res.status(500).json({ error: 'Backend not configured.' });

  const token = (req.headers.authorization || '').replace(/^Bearer\s+/i, '');
  const { lodge } = req.body || {};
  if (!lodge) return res.status(400).json({ error: 'Missing lodge.' });

  // Not logged in → public: the page already shows rack rates, so just say so.
  if (!token) return res.status(200).json({ state: 'public' });

  const supa = createClient(url, anon, { global: { headers: { Authorization: `Bearer ${token}` } } });

  // Who is the agent?
  const { data: userData, error: userErr } = await supa.auth.getUser();
  if (userErr || !userData?.user) return res.status(401).json({ error: 'Invalid session.' });
  const agentId = userData.user.id;

  // Lodge
  const { data: lodgeRow } = await supa.from('lodges').select('id,name').eq('slug', lodge).single();
  if (!lodgeRow) return res.status(404).json({ error: 'Lodge not found.' });

  // Assignment (RLS: only the agent's own row is visible)
  const { data: assign } = await supa.from('assignments')
    .select('tier').eq('lodge_id', lodgeRow.id).eq('agent_id', agentId).maybeSingle();

  if (!assign) {
    return res.status(200).json({ state: 'unassigned', message: 'Ratesheet update to follow — contact supplier.' });
  }

  // Contract signed?
  const { data: signed } = await supa.from('contracts')
    .select('id').eq('lodge_id', lodgeRow.id).eq('agent_id', agentId).maybeSingle();
  if (!signed) {
    return res.status(200).json({ state: 'needs_contract', tier: assign.tier });
  }

  // Compute tier rates from rack (public) — tier_price = rack * (1 - tier/100)
  const { data: rates } = await supa.from('rates')
    .select('section,room_type,rack_price,sort').eq('lodge_id', lodgeRow.id).order('sort');
  const factor = 1 - assign.tier / 100;
  const fmt = (n) => Math.round(n).toLocaleString('en-US');

  const sections = {};
  (rates || []).forEach(r => {
    (sections[r.section] = sections[r.section] || []).push([r.room_type, fmt(r.rack_price * factor)]);
  });

  return res.status(200).json({
    state: 'ok',
    lodge: lodgeRow.name,
    tier: assign.tier,
    badge: `Net STO · ${assign.tier}%`,
    sections: Object.keys(sections).map(t => ({ title: t, rows: sections[t] }))
  });
};
