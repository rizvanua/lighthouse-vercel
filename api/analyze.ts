import { VercelRequest, VercelResponse } from "@vercel/node";
import { analyzeUrl } from "./utils/analyzeUrl.js";
import { setHeaders } from "./utils/setHeaders.js";



export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Set CORS headers
  setHeaders(res, [
    { name: "Access-Control-Allow-Origin", key: "*" },
    { name: "Access-Control-Allow-Methods", key: "GET, POST, OPTIONS" },
    { name: "Access-Control-Allow-Headers", key: "Content-Type" },
  ]);

  // Handle preflight requests
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    console.log("[req.body]", req.body);
    const { url } = req.body;
    console.log("[url]", url);
    if (!url) {
      return res.status(400).json({ error: "URLs is required" });
    }

    console.log("[urlsToAnalyze]", url);
    const results = await analyzeUrl(url);
    console.log("[results]", results);
    return res.status(200).json({ results });
  } catch (error) {
    console.error("[error]", error);
    return res.status(400).json({ error: "Invalid request body" });
  }
}
