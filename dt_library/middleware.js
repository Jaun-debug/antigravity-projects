// Vercel Edge Middleware — TEMPORARILY DISABLED (agent gate removed on request).
//
// The /ratesheets/ STO pages are openly accessible for the moment while the site is
// under construction (rates shown are fictitious sample rates). To RE-ENABLE the gate,
// restore the previous version (saved) or set ENABLE_GATE below to true.
//
// Previous gated logic is preserved in version control / backup.

const ENABLE_GATE = false;

export const config = { matcher: '/ratesheets/:path*' };

async function sessionToken(pass) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('nr-agent-session|' + pass));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

export default async function middleware(request) {
  if (!ENABLE_GATE) return;   // gate disabled -> allow everyone through

  const pass = process.env.AGENT_PASS || '';
  const origin = new URL(request.url).origin;
  const denied = Response.redirect(origin + '/?agent=1', 302);
  if (!pass) return denied;
  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)nr_session=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : '';
  if (token && token === (await sessionToken(pass))) return;
  return denied;
}
