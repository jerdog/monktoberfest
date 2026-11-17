import { test } from "node:test";
import assert from "node:assert/strict";
import worker, { isAllowedOrigin } from "../cms-auth/src/index.js";

const env = {
  GITHUB_CLIENT_ID: "client-id",
  GITHUB_CLIENT_SECRET: "client-secret",
  ALLOWED_DOMAINS: "monktoberfest.com,*.jerdog.workers.dev,localhost",
};

test("origin allow-list", () => {
  assert.ok(isAllowedOrigin("https://monktoberfest.com", env.ALLOWED_DOMAINS));
  assert.ok(isAllowedOrigin("https://abc123-monktoberfest-web.jerdog.workers.dev", env.ALLOWED_DOMAINS));
  assert.ok(isAllowedOrigin("http://localhost:3000", env.ALLOWED_DOMAINS));
  assert.ok(!isAllowedOrigin("http://monktoberfest.com", env.ALLOWED_DOMAINS));
  assert.ok(!isAllowedOrigin("https://monktoberfest.com.evil.test", env.ALLOWED_DOMAINS));
  assert.ok(!isAllowedOrigin("https://evilmonktoberfest.com", env.ALLOWED_DOMAINS));
  assert.ok(!isAllowedOrigin("https://jerdog.workers.dev", env.ALLOWED_DOMAINS));
});

test("/auth redirects to GitHub with a state cookie", async () => {
  const res = await worker.fetch(new Request("https://auth.test/auth?provider=github&scope=repo"), env);
  assert.equal(res.status, 302);
  const loc = new URL(res.headers.get("Location"));
  assert.equal(loc.origin + loc.pathname, "https://github.com/login/oauth/authorize");
  assert.equal(loc.searchParams.get("client_id"), "client-id");
  assert.equal(loc.searchParams.get("redirect_uri"), "https://auth.test/callback");
  const state = loc.searchParams.get("state");
  assert.match(res.headers.get("Set-Cookie"), new RegExp(`cms_oauth_state=${state};.*HttpOnly`));
});

test("/callback rejects a mismatched state", async () => {
  const res = await worker.fetch(
    new Request("https://auth.test/callback?code=abc&state=one", { headers: { Cookie: "cms_oauth_state=two" } }),
    env,
  );
  const body = await res.text();
  assert.match(body, /authorization:github:error:/);
  assert.doesNotMatch(body, /token/);
});

test("/callback exchanges the code and returns the token to an allowed opener only", async (t) => {
  t.mock.method(globalThis, "fetch", async (url, init) => {
    assert.equal(url, "https://github.com/login/oauth/access_token");
    assert.equal(JSON.parse(init.body).code, "abc");
    return Response.json({ access_token: "gho_test" });
  });
  const res = await worker.fetch(
    new Request("https://auth.test/callback?code=abc&state=s1", { headers: { Cookie: "cms_oauth_state=s1" } }),
    env,
  );
  const body = await res.text();
  assert.match(body, /authorization:github:success:/);
  assert.match(body, /gho_test/);
  assert.match(body, /if \(!ok\(e\.origin\)/);
  assert.match(res.headers.get("Set-Cookie"), /Max-Age=0/);
});
