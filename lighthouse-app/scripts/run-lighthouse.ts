import fs from 'fs';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';
import fetch from 'node-fetch';
import http from 'http';

const PORT = 3090;
const SITE_ID = 'default-site';
const TARGET_URL = 'https://example.com'; // Default URL, can be changed via API
const DASHBOARD_API = 'http://localhost:3090/metrics'; // Local endpoint for now

interface AnalysisResult {
  success: boolean;
  url: string;
  lcp?: number;
  ttfb?: number;
  error?: string;
  report?: any;
}

async function runLighthouse(url: string): Promise<AnalysisResult> {
  const chrome = await launch({
    chromeFlags: [
      '--headless',
      '--no-sandbox',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--disable-setuid-sandbox',
      '--no-first-run',
      '--no-zygote',
      '--single-process'
    ],
    chromePath: process.env.CHROME_PATH || undefined
  });

  try {
    const result = await lighthouse(url, {
      port: chrome.port,
      output: 'json',
      logLevel: 'info',
    });
    if (!result || !result.lhr) {
      throw new Error('Lighthouse failed to produce a result');
    }
    const reportJson = result.report as string;
    const report = result.lhr;

    const lcp = report.audits['largest-contentful-paint'].numericValue;
    const ttfb = report.audits['server-response-time'].numericValue;

    console.log(`✅ Lighthouse results for ${url}`);
    console.log('LCP:', lcp);
    console.log('TTFB:', ttfb);

    // Save the report to disk with URL in filename
    const safeUrl = url.replace(/[^a-z0-9]/gi, '_').toLowerCase();
    fs.writeFileSync(`lighthouse-report-${safeUrl}.json`, reportJson);

    return {
      success: true,
      url,
      lcp,
      ttfb,
      report: JSON.parse(reportJson)
    };
  } catch (err) {
    console.error(`❌ Lighthouse failed for ${url}:`, err);
    return {
      success: false,
      url,
      error: err instanceof Error ? err.message : 'Unknown error'
    };
  } finally {
    await chrome.kill();
  }
}

async function analyzeUrls(urls: string[]): Promise<AnalysisResult[]> {
  // Run analyses in parallel with a maximum of 2 concurrent analyses
  const results: AnalysisResult[] = [];
  const chunks = [];
  
  // Split URLs into chunks of 2
  for (let i = 0; i < urls.length; i += 2) {
    chunks.push(urls.slice(i, i + 2));
  }

  // Process each chunk in parallel
  for (const chunk of chunks) {
    const chunkResults = await Promise.all(chunk.map(url => runLighthouse(url)));
    results.push(...chunkResults);
  }

  return results;
}

// Create HTTP server
const server = http.createServer(async (req, res) => {
  res.setHeader('Content-Type', 'application/json');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  if (req.method === 'POST' && req.url === '/analyze') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', async () => {
      try {
        const { urls } = JSON.parse(body);
        if (!urls || !Array.isArray(urls) || urls.length === 0) {
          res.writeHead(400);
          res.end(JSON.stringify({ error: 'URLs array is required' }));
          return;
        }

        // Limit to maximum 2 URLs
        const urlsToAnalyze = urls.slice(0, 2);
        const results = await analyzeUrls(urlsToAnalyze);
        
        res.writeHead(200);
        res.end(JSON.stringify({ results }));
      } catch (error) {
        res.writeHead(400);
        res.end(JSON.stringify({ error: 'Invalid request body' }));
      }
    });
  } else if (req.method === 'GET' && req.url === '/health') {
    res.writeHead(200);
    res.end(JSON.stringify({ status: 'healthy' }));
  } else {
    res.writeHead(404);
    res.end(JSON.stringify({ error: 'Not found' }));
  }
});

server.listen(PORT, () => {
  console.log(`🚀 Lighthouse server running on port ${PORT}`);
  console.log(`📊 Health check available at http://localhost:${PORT}/health`);
  console.log(`🔍 Send POST requests to http://localhost:${PORT}/analyze with a JSON body containing a "urls" array`);
});
