// Vercel Edge Middleware — agent gate.
//
// TWO independent gates share the same session check:
//   1. /builder/*    -> ALWAYS gated. The Itinerary Builder is an agent-only tool and
//                       must never be reachable by signed-out visitors, even by direct URL.
//   2. /ratesheets/* -> gated only when ENABLE_GATE is true. Currently OFF while the site
//                       is under construction (rates shown are fictitious sample rates).
//
// A valid session = an `nr_session` cookie whose value equals sessionToken(AGENT_PASS).
// The homepage login sets this cookie; sign-out (homepage AND shared header) clears it.

const ENABLE_GATE = false;   // controls /ratesheets/* only — /builder/* is always gated

export const config = { matcher: ['/ratesheets/:path*', '/builder', '/builder/:path*'] };

async function sessionToken(pass) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode('nr-agent-session|' + pass));
  return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('').slice(0, 40);
}

export default async function middleware(request) {
  const url = new URL(request.url);
  const isBuilder = url.pathname === '/builder' || url.pathname.startsWith('/builder/');

  // Builder is always gated; ratesheets only when ENABLE_GATE. Everything else passes.
  if (!isBuilder && !ENABLE_GATE) return;

  const pass = process.env.AGENT_PASS || '';
  const denied = Response.redirect(url.origin + '/?agent=1', 302);
  if (!pass) return denied;

  const cookie = request.headers.get('cookie') || '';
  const m = cookie.match(/(?:^|;\s*)nr_session=([^;]+)/);
  const token = m ? decodeURIComponent(m[1]) : '';
  if (token && token === (await sessionToken(pass))) return;   // valid agent session -> allow

  return denied;   // signed out -> bounce to homepage sign-in
}
