// GitHub OAuth for Sveltia CMS (also compatible with Decap/Netlify CMS).
//
// Flow: the CMS opens a popup at /auth -> we redirect to GitHub -> GitHub sends
// the user back to /callback with a code -> we exchange it for a token and hand
// the token to the CMS window with postMessage, but only if that window is on
// one of ALLOWED_DOMAINS.
//
// Configuration (see README):
//   GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET  secrets (wrangler secret put …)
//   ALLOWED_DOMAINS                          comma-separated hostnames; "*.example.com" allowed

const STATE_COOKIE = "cms_oauth_state";

export function isAllowedOrigin(origin, allowedDomains) {
  let host;
  try {
    const url = new URL(origin);
    if (url.protocol !== "https:" && !(url.protocol === "http:" && ["localhost", "127.0.0.1"].includes(url.hostname))) {
      return false;
    }
    host = url.hostname;
  } catch {
    return false;
  }
  return String(allowedDomains ?? "")
    .split(",")
    .map((d) => d.trim().toLowerCase())
    .filter(Boolean)
    .some((d) => (d.startsWith("*.") ? host.endsWith(d.slice(1)) && host !== d.slice(2) : host === d));
}

function html(body, status = 200, headers = {}) {
  return new Response(`<!doctype html><html><head><meta charset="utf-8"><title>Signing in…</title></head><body>${body}</body></html>`, {
    status,
    headers: {
      "Content-Type": "text/html;charset=UTF-8",
      "Cache-Control": "no-store",
      "Content-Security-Policy": "default-src 'none'; script-src 'unsafe-inline'",
      ...headers,
    },
  });
}

/** Page that passes the result back to the CMS window, then closes. */
function resultPage(env, status, content, extraHeaders) {
  const message = `authorization:github:${status}:${JSON.stringify(content)}`;
  const allowed = JSON.stringify(String(env.ALLOWED_DOMAINS ?? ""));
  return html(
    `<p>${status === "success" ? "Signed in. You can close this window." : "Sign-in failed. You can close this window and try again."}</p>
<script>
(() => {
  const allowed = ${allowed}.split(",").map((d) => d.trim().toLowerCase()).filter(Boolean);
  const ok = (origin) => {
    try {
      const u = new URL(origin);
      const local = u.protocol === "http:" && (u.hostname === "localhost" || u.hostname === "127.0.0.1");
      if (u.protocol !== "https:" && !local) return false;
      return allowed.some((d) => d.startsWith("*.") ? u.hostname.endsWith(d.slice(1)) && u.hostname !== d.slice(2) : u.hostname === d);
    } catch { return false; }
  };
  const message = ${JSON.stringify(message).replace(/</g, "\\u003c")};
  window.addEventListener("message", (e) => {
    if (!ok(e.origin) || e.data !== "authorizing:github") return;
    window.opener.postMessage(message, e.origin);
    setTimeout(() => window.close(), 300);
  });
  if (window.opener) window.opener.postMessage("authorizing:github", "*");
})();
</script>`,
    200,
    extraHeaders,
  );
}

function cookies(request) {
  return Object.fromEntries(
    (request.headers.get("Cookie") ?? "")
      .split(";")
      .map((c) => c.trim().split("="))
      .filter(([k]) => k)
      .map(([k, ...v]) => [k, v.join("=")]),
  );
}

async function handleAuth(request, env) {
  const url = new URL(request.url);
  if (url.searchParams.get("provider") && url.searchParams.get("provider") !== "github") {
    return html("<p>Unsupported provider.</p>", 400);
  }
  if (!env.GITHUB_CLIENT_ID || !env.GITHUB_CLIENT_SECRET) {
    return html("<p>The sign-in service is not configured yet (missing GitHub OAuth secrets).</p>", 500);
  }
  const state = crypto.randomUUID();
  const authorize = new URL("https://github.com/login/oauth/authorize");
  authorize.searchParams.set("client_id", env.GITHUB_CLIENT_ID);
  authorize.searchParams.set("scope", url.searchParams.get("scope") || "repo,user");
  authorize.searchParams.set("state", state);
  authorize.searchParams.set("redirect_uri", `${url.origin}/callback`);
  return new Response(null, {
    status: 302,
    headers: {
      Location: authorize.toString(),
      "Set-Cookie": `${STATE_COOKIE}=${state}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=600`,
      "Cache-Control": "no-store",
    },
  });
}

async function handleCallback(request, env) {
  const url = new URL(request.url);
  const clear = { "Set-Cookie": `${STATE_COOKIE}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0` };
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  if (!code || !state || cookies(request)[STATE_COOKIE] !== state) {
    return resultPage(env, "error", { provider: "github", error: "Invalid or expired sign-in attempt." }, clear);
  }
  const res = await fetch("https://github.com/login/oauth/access_token", {
    method: "POST",
    headers: { Accept: "application/json", "Content-Type": "application/json", "User-Agent": "monktoberfest-cms-auth" },
    body: JSON.stringify({
      client_id: env.GITHUB_CLIENT_ID,
      client_secret: env.GITHUB_CLIENT_SECRET,
      code,
      redirect_uri: `${url.origin}/callback`,
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    return resultPage(env, "error", { provider: "github", error: data.error_description || "GitHub did not return a token." }, clear);
  }
  return resultPage(env, "success", { provider: "github", token: data.access_token }, clear);
}

export default {
  async fetch(request, env) {
    const { pathname } = new URL(request.url);
    if (request.method !== "GET") return new Response("Method not allowed", { status: 405 });
    if (pathname === "/auth") return handleAuth(request, env);
    if (pathname === "/callback") return handleCallback(request, env);
    if (pathname === "/") return new Response("Monktoberfest CMS sign-in service.", { headers: { "Content-Type": "text/plain" } });
    return new Response("Not found", { status: 404 });
  },
};
