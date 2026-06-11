// Vercel Edge Middleware — gates the bookable net-STO rate sheets.
//
// Only a signed-in agent (valid session cookie) may load anything under /ratesheets/.
// Everyone else is redirected to the homepage to sign in, so net STO rates are never
// served to the public. The session token is derived from AGENT_PASS, exactly as in
// api/sto.js, so the two always agree and rotate together if the password changes.

export const config = { matcher: '/ratesheets/:path*' };

async function sessionToken(pass) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('nr-agent-session|' + pass));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

export default async function middleware(request) {
  const pass = process.env.AGENT_PASS || '';
  const origin = new URL(request.url).origin;
  const denied = Response.redirect(origin + '/?agent=1', 302);

  if (!pass) return denied;   // misconfigured -> fail closed (never leak STO)

  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)nr_session=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : '';

  if (token && token === (await sessionToken(pass))) return;  // valid session -> allow
  return denied;
}
