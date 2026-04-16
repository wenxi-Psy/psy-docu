/**
 * Cloudflare Worker — Reverse Proxy for Alibaba Cloud FC Deployment
 *
 * Purpose: Relay traffic from a Cloudflare Worker (accessible in mainland China)
 *          to the FC deployment. Also strips the platform-injected
 *          "Content-Disposition: attachment" header that prevents browsers
 *          from rendering HTML responses from *.fcapp.run domains.
 *
 * Deploy steps:
 *   1. Install wrangler: npm install -g wrangler
 *   2. wrangler login
 *   3. wrangler deploy  (from the cloudflare-proxy/ directory)
 *   4. (Optional) Bind a custom domain via Cloudflare for better CN access
 *
 * Note: workers.dev subdomains may be slow in some CN regions.
 *       Binding a custom domain via Cloudflare is strongly recommended.
 */

const TARGET_HOST = "psy-docu-dlhctqrbfg.cn-hangzhou.fcapp.run";

export default {
  async fetch(request, env, ctx) {
    return handleRequest(request);
  },
};

async function handleRequest(request) {
  const url = new URL(request.url);

  // Rewrite hostname to FC endpoint
  url.hostname = TARGET_HOST;
  url.port = "";
  url.protocol = "https:";

  // Forward all original headers, set Host to FC host
  const headers = new Headers(request.headers);
  headers.set("Host", TARGET_HOST);
  headers.set("X-Forwarded-Host", new URL(request.url).hostname);

  const proxyRequest = new Request(url.toString(), {
    method: request.method,
    headers,
    body: request.body,
    redirect: "manual", // Handle redirects to rewrite Location headers
  });

  let response = await fetch(proxyRequest);

  // Build mutable response headers, stripping the FC-injected attachment header
  const responseHeaders = new Headers(response.headers);
  responseHeaders.delete("Content-Disposition");

  // If FC redirects, rewrite the Location header to point back to this Worker
  if ([301, 302, 303, 307, 308].includes(response.status)) {
    const location = responseHeaders.get("Location");
    if (location) {
      const locationUrl = new URL(location, `https://${TARGET_HOST}`);
      if (locationUrl.hostname === TARGET_HOST) {
        locationUrl.hostname = new URL(request.url).hostname;
        locationUrl.protocol = new URL(request.url).protocol;
        responseHeaders.set("Location", locationUrl.toString());
      }
    }
  }

  return new Response(response.body, {
    status: response.status,
    statusText: response.statusText,
    headers: responseHeaders,
  });
}
