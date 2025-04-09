import http from 'http';
import { fork } from 'child_process';



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

// Wrap child process in a promise
function runWorker(input:string): Promise<AnalysisResult> {
    return new Promise((resolve, reject) => {
      const child = fork('./dist/run-lighthouse.js', [input]);
  
      child.on('message', (msg:AnalysisResult) => {
        resolve(msg);
      });
  
      child.on('error', (err) => {
        reject(err);
      });
  
      child.on('exit', (code) => {
        if (code !== 0) {
          reject(new Error(`Child process exited with code ${code}`));
        }
      });
    });
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
    const chunkResults = await Promise.all(chunk.map(url => runWorker(url)));
    results.push(...chunkResults);
  }
  console.log('!!!RESULTS', results)
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
