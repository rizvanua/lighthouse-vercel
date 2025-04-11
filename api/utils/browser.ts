import { launch, Browser } from "puppeteer-core";
import chromium from "@sparticuz/chromium";

export async function launchBrowser(): Promise<Browser> {
  return await launch({
    args: chromium.args,
    executablePath: await chromium.executablePath(),
    headless: chromium.headless as boolean | "shell",
  });
}
