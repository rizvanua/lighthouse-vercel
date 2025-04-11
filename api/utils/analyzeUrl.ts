import lighthouse from "lighthouse";
import { Browser } from "puppeteer-core";
import { launchBrowser } from "./browser.js";
import { getLighthouseConfig } from "./lighthouseConfig.js";
export interface AnalysisResult {
  success: boolean;
  url: string;
  lcp?: number;
  ttfb?: number;
  error?: string;
  report?: any;
}

export async function analyzeUrl(url: string): Promise<AnalysisResult> {
  let browser: Browser | null = null;

  try {
    console.log("[Node.js version]", process.version);

    browser = await launchBrowser();

    const wsEndpoint = browser.wsEndpoint();
    const port = parseInt(new URL(wsEndpoint).port, 10);
    const lighthouseOptions = getLighthouseConfig(port);

    const result = await lighthouse(url, lighthouseOptions);

    if (!result?.lhr) {
      throw new Error("Lighthouse failed to produce a result");
    }

    const { lhr } = result;
    const lcp = lhr.audits["largest-contentful-paint"]?.numericValue;
    const ttfb = lhr.audits["server-response-time"]?.numericValue;

    return {
      success: true,
      url,
      lcp,
      ttfb,
      report: lhr,
    };
  } catch (error) {
    console.error(`Lighthouse failed for ${url}:`, error);
    return {
      success: false,
      url,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  } finally {
    if (browser) {
      await browser.close();
    }
  }
}
