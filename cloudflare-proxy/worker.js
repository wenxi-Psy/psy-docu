/**
 * Cloudflare Worker — Reverse Proxy for Vercel Deployment
 *
 * Purpose: Relay traffic from a Cloudflare Worker (accessible in mainland China)
 *          to the Vercel deployment that is blocked.
 *
 * Deploy steps:
 *   1. Sign up at https://workers.cloudflare.com (free tier: 100k req/day)
 *   2. Create a new Worker, paste this script
 *   3. Set the TARGET_HOST constant below to your Vercel URL
 *   4. (Optional) Bind a custom domain to the Worker for better CN accessibility
 *
 * Note: workers.dev subdomains may themselves be slow in some CN regions.
 *       Binding a custom domain via Cloudflare is strongly recommended.
 */

const TARGET_HOST = "psy-docu-git-main-wenxi-psys-projects.vercel.app";

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};

async function handleRequest(request) {
  const url = new URL(request.url);

  // Rewrite hostname to the Vercel deployment
  url.hostname = TARGET_HOST;
  url.port = "";

  // Forward all original headers, but set Host to the Vercel host
  const headers = new Headers(request.headers);
  headers.set("Host", TARGET_HOST);
  // Pass real visitor IP to Vercel for logging
  headers.set("X-Forwarded-Host", new URL(request.url).hostname);

  const proxyRequest = new Request(url.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual", // Handle redirects ourselves to rewrite Location headers
  });

  let response = await fetch(proxyRequest);

  // If Vercel redirects, rewrite the Location header so it points to THIS worker
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = response.headers.get("Location");
    if (location) {
      const workerOrigin = new URL(request.url).origin;
      const locationUrl = new URL(location, `https://${TARGET_HOST}`);
      if (locationUrl.hostname === TARGET_HOST) {
        locationUrl.hostname = new URL(request.url).hostname;
      }
      const newHeaders = new Headers(response.headers);
      newHeaders.set("Location", locationUrl.toString());
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders,
      });
    }
  }

  // Pass through response as-is (including Set-Cookie for auth)
  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
}
