// Authorizes a direct browser->Vercel Blob upload, so large rate-sheet PDFs
// bypass the ~4.5MB serverless request-body limit. The browser uploads the raw
// file straight to Blob and only sends /api/upload a small URL afterwards.
//
// Uses @vercel/blob/client handleUpload. Requires BLOB_READ_WRITE_TOKEN.

const db = require('./_ratesdb');
const auth = require('./_auth');

function readBody(req) {
  return new Promise(function (resolve) {
    if (req.body && typeof req.body === 'object') return resolve(req.body);
    let data = '';
    req.on('data', function (c) { data += c; });
    req.on('end', function () { try { resolve(JSON.parse(data || '{}')); } catch (e) { resolve({}); } });
    req.on('error', function () { resolve({}); });
  });
}

module.exports = async function (req, res) {
  res.setHeader('Content-Type', 'application/json');
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });
  let handleUpload;
  try { handleUpload = require('@vercel/blob/client').handleUpload; }
  catch (e) { return res.status(500).json({ error: 'Blob client not installed.' }); }

  const body = await readBody(req);
  try {
    const jsonResponse = await handleUpload({
      body: body,
      request: req,
      onBeforeGenerateToken: async function (pathname, clientPayload) {
        // Only signed-in suppliers/owners (portal cookie) or the owner token may upload.
        const caller = auth.sessionFromReq(req);
        let ok = caller && (caller.role === 'supplier' || caller.role === 'owner');
        if (!ok && clientPayload) {
          try { const p = JSON.parse(clientPayload); if (p && p.token && db.isOwner({ token: String(p.token) })) ok = true; } catch (e) {}
        }
        if (!ok) throw new Error('Not authorized to upload.');
        return {
          allowedContentTypes: ['application/pdf'],
          maximumSizeInBytes: 25 * 1024 * 1024,
          addRandomSuffix: true,
        };
      },
      onUploadCompleted: async function () { /* nothing to do */ },
    });
    return res.status(200).json(jsonResponse);
  } catch (e) {
    return res.status(400).json({ error: String(e && e.message ? e.message : e) });
  }
};
