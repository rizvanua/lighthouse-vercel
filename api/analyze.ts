import { VercelRequest, VercelResponse } from '@vercel/node';
import { analyzeUrl } from './utils.js';

interface AnalysisResult {
  success: boolean;
  url: string;
  lcp?: number;
  ttfb?: number;
  error?: string;
  report?: any;
}


export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  // Only allow POST requests
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    console.log('[req.body]', req.body);
    const { url } = req.body;
    console.log('[url]', url);
    if (!url) {
      return res.status(400).json({ error: 'URLs array is required' });
    }

    
    console.log('[urlsToAnalyze]', url);
    const results = await analyzeUrl(url);
    console.log('[results]', results);
    return res.status(200).json({ results });
  } catch (error) {
    console.error('[error]', error);
    return res.status(400).json({ error: 'Invalid request body' });
  }
} 