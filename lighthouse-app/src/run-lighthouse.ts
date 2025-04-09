import fs from 'fs';
import lighthouse from 'lighthouse';
import { launch } from 'chrome-launcher';



interface AnalysisResult {
  success: boolean;
  url: string;
  lcp?: number;
  ttfb?: number;
  error?: string;
  report?: any;
}
const url = process.argv.slice(2)[0];
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

runLighthouse(url).then((result) => {
  console.log('!!!WORKER-RESULT', result)
  if(process.send){
  process.send(result);
  }
}
).catch((err) => {
  console.error('Error in child process:', err);
  process.exit(1);
}
);