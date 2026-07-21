// AI extraction — sends a supplier PDF to Claude and returns structured rack rates
// plus a confidence score and anomaly flags. No auto-publish: output is reviewed.
//
// Requires ANTHROPIC_API_KEY. Model is configurable via ANTHROPIC_MODEL.

const db = require('./_ratesdb');

function extractConfigured() {
  return !!process.env.ANTHROPIC_API_KEY;
}

const SYSTEM = 'You are a meticulous data-entry assistant for a Namibian travel-trade rates platform. ' +
  'You read a supplier rate-card PDF and return ONLY the rates it contains, exactly as printed, as strict JSON. ' +
  'Never invent, round, or infer numbers you cannot read. If a value is unreadable, use the string "CHECK" for it.';

const INSTRUCTIONS =
  'Extract the rates from this rate card into this exact JSON shape.\n' +
  'IMPORTANT: one PDF often covers SEVERAL properties (camps / lodges / hotels). Return EVERY property separately in "properties".\n' +
  '{\n' +
  '  "properties": [\n' +
  '    {\n' +
  '      "name": "<property name exactly as printed>",\n' +
  '      "region": "<region if shown, else empty>",\n' +
  '      "currency": "N$",\n' +
  '      "validity": "<validity/season dates if shown>",\n' +
  '      "year": "<the season/rate year, e.g. 2026 or 2027, if you can tell; else empty>",\n' +
  '      "note": "<short note: inclusions, levy/VAT, per person/unit>",\n' +
  '      "sections": [ { "title": "<room type or season>", "rows": [ ["<rate label>", "<price as printed, e.g. 4,397>"] ] } ]\n' +
  '    }\n' +
  '  ],\n' +
  '  "confidence": <integer 0-100, your confidence the numbers are correct>,\n' +
  '  "anomalies": [ "<plain-english flag for anything unusual: unreadable value, price that looks off, missing column, etc.>" ]\n' +
  '}\n\n' +
  'Rules: one entry in "properties" per distinct property/camp/lodge. If the card covers only one property, return exactly one entry. ' +
  'Never merge two properties into one entry, and never split one property across entries. ' +
  'Rates that apply across the whole group (transfers, lodge hops, activities not tied to one camp) go in a final entry named "<operator> — shared". ' +
  'Keep prices as printed (with commas, no currency symbol). One section per room type (or per season/vehicle group). ' +
  'Keep row labels SHORT: put anything common to a whole block (season, vehicle group, board basis, duration band) in the section "title" ' +
  'instead of repeating it in every row label. Never repeat the property name inside row labels. ' +
  'Put every rate category (single, sharing, child, DBB/BB, etc.) as its own row. ' +
  'Flag in "anomalies" any value you had to guess, any garbled/partial number (mark it "CHECK"), and any price that breaks an obvious rule ' +
  '(single cheaper than sharing, child dearer than adult, a value 10x its neighbours). ' +
  'Lower "confidence" when the PDF is a scan, is garbled, or you had to flag things. Return ONLY the JSON object, no prose.';

function parseJson(text) {
  if (!text) return null;
  let s = String(text).trim();
  // strip code fences if present
  const fence = s.match(/```(?:json)?\s*([\s\S]*?)```/i);
  if (fence) s = fence[1].trim();
  // grab the outermost object
  const first = s.indexOf('{'), last = s.lastIndexOf('}');
  if (first >= 0 && last > first) s = s.slice(first, last + 1);
  try { return JSON.parse(s); } catch (e) { return null; }
}

// Calls Claude with a base64 PDF. Returns { ok, doc, confidence, anomalies, error }.
async function extractFromPdf(base64pdf) {
  if (!extractConfigured()) return { ok: false, error: 'AI extraction not configured (ANTHROPIC_API_KEY missing).' };
  let Anthropic;
  try { Anthropic = require('@anthropic-ai/sdk'); } catch (e) { return { ok: false, error: 'Anthropic SDK not installed.' }; }
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  const model = process.env.ANTHROPIC_MODEL || 'claude-sonnet-5';
  try {
    const resp = await client.messages.create({
      model: model,
      max_tokens: 32000,
      system: SYSTEM,
      messages: [{
        role: 'user',
        content: [
          { type: 'document', source: { type: 'base64', media_type: 'application/pdf', data: base64pdf } },
          { type: 'text', text: INSTRUCTIONS },
        ],
      }],
    });
    const text = (resp.content || []).map(function (b) { return b && b.text ? b.text : ''; }).join('');
    const parsed = parseJson(text);
    // Accept the multi-property shape, or a single-property doc (older shape).
    let list = null;
    if (parsed && Array.isArray(parsed.properties)) list = parsed.properties;
    else if (parsed && Array.isArray(parsed.sections)) list = [parsed];
    if (!list || !list.length) {
      const stop = resp && resp.stop_reason ? resp.stop_reason : '';
      const hint = stop === 'max_tokens' ? ' (the sheet was too long and got cut off — try splitting it)' : '';
      return { ok: false, error: 'Could not read this PDF into rates' + hint + '. AI said: ' + String(text || '').slice(0, 300) };
    }
    const properties = list.map(function (p) {
      return {
        name: (p && p.name) || '', region: (p && p.region) || '', currency: (p && p.currency) || 'N$',
        validity: (p && p.validity) || '', year: p && p.year ? String(p.year).replace(/[^0-9]/g, '') : '',
        note: (p && p.note) || '', sections: Array.isArray(p && p.sections) ? p.sections : [],
      };
    }).filter(function (p) { return p.sections.length; });
    if (!properties.length) return { ok: false, error: 'No rates found in that PDF.' };
    return {
      ok: true,
      doc: properties[0],          // first property (backwards compatible)
      properties: properties,      // every property found in the sheet
      confidence: typeof parsed.confidence === 'number' ? Math.max(0, Math.min(100, parsed.confidence)) : null,
      anomalies: Array.isArray(parsed.anomalies) ? parsed.anomalies.filter(Boolean) : [],
    };
  } catch (e) {
    return { ok: false, error: String(e && e.message ? e.message : e) };
  }
}

// Compare a freshly-extracted rack doc against what's already stored for a slug.
// Returns [{ label, section, from, to, pct }] for rows that exist in both.
function num(v) { var n = parseFloat(String(v == null ? '' : v).replace(/[^0-9.\-]/g, '')); return isNaN(n) ? null : n; }
async function yearDiff(slug, newDoc) {
  if (!slug) return [];
  const prev = await db.getRates('rack', slug);
  if (!prev || !Array.isArray(prev.sections)) return [];
  const prevMap = {};
  prev.sections.forEach(function (s) {
    (s.rows || []).forEach(function (r) { const k = (s.title || '') + '|' + (r[0] || ''); prevMap[k] = num(r[1]); });
  });
  const out = [];
  (newDoc.sections || []).forEach(function (s) {
    (s.rows || []).forEach(function (r) {
      const k = (s.title || '') + '|' + (r[0] || '');
      const from = prevMap[k], to = num(r[1]);
      if (from != null && to != null && from !== to) {
        out.push({ section: s.title || '', label: r[0] || '', from: from, to: to, pct: from ? Math.round(((to - from) / from) * 100) : null });
      }
    });
  });
  return out;
}

module.exports = { extractConfigured, extractFromPdf, yearDiff };
