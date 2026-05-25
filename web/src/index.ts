import { serve } from "bun";
import index from "./index.html";

const UPSTREAM = process.env.API_UPSTREAM || "http://localhost:8000";

const server = serve({
  routes: {
    "/api/*": async (req) => {
      const url = new URL(req.url);
      return fetch(`${UPSTREAM}${url.pathname}${url.search}`, {
        method: req.method,
        headers: req.headers,
        body: req.body,
      });
    },
    "/*": index,
  },

  development: process.env.NODE_ENV !== "production" && {
    hmr: true,
    console: true,
  },
});

console.log(`web server running at ${server.url}`);
