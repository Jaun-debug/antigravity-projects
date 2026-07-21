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
  'Extract the RACK (published/retail) rates from this rate card into this exact JSON shape:\n' +
  '{\n' +
  '  "name": "<property/operator name>",\n' +
  '  "region": "<region if shown, else empty>",\n' +
  '  "currency": "N$",\n' +
  '  "validity": "<validity/season dates if shown>",\n' +
  '  "year": "<the season/rate year this card is for, e.g. 2026 or 2027, if you can tell from the dates or title; else empty>",\n' +
  '  "note": "<short note: inclusions, levy/VAT, per person/unit>",\n' +
  '  "sections": [ { "title": "<room type or season>", "rows": [ ["<rate label>", "<price as printed, e.g. 4,397>"] ] } ],\n' +
  '  "confidence": <integer 0-100, your confidence the numbers are correct>,\n' +
  '  "anomalies": [ "<plain-english flag for anything unusual: unreadable value, price that looks off, missing column, etc.>" ]\n' +
  '}\n\n' +
  'Rules: keep prices as printed (with commas, no currency symbol). One section per room type (or per season). ' +
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
      max_tokens: 4096,
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
    if (!parsed || !Array.isArray(parsed.sections)) {
      return { ok: false, error: 'Could not parse extraction output.', raw: text.slice(0, 500) };
    }
    const doc = {
      name: parsed.name || '', region: parsed.region || '', currency: parsed.currency || 'N$',
      validity: parsed.validity || '', year: parsed.year ? String(parsed.year).replace(/[^0-9]/g, '') : '',
      note: parsed.note || '', sections: parsed.sections,
    };
    return {
      ok: true, doc: doc,
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
