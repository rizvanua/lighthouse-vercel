import lighthouse from "lighthouse";
import chromium from "@sparticuz/chromium";
import { launch, Browser } from "puppeteer-core";

export interface AnalysisResult {
  success: boolean;
  url: string;
  lcp?: number;
  ttfb?: number;
  error?: string;
  report?: any;
}

async function launchBrowser(): Promise<Browser> {
  return await launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless as boolean | "shell",
  });
}

function getLighthouseConfig(port: number) {
  return {
    port,
    output: "json",
    logLevel: "info",
    config: {
      extends: "lighthouse:default",
      settings: {
        onlyAudits: [
          "first-contentful-paint",
          "interactive",
          "speed-index",
          "largest-contentful-paint",
          "cumulative-layout-shift",
        ],
        ignoreDefaultArgs: ["--disable-extensions"],
        formFactor: "desktop",
        screenEmulation: {
          mobile: false,
          width: 1350,
          height: 940,
          deviceScaleFactor: 1,
          disabled: false,
        },
        throttlingMethod: "devtools",
      },
    },
  };
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
