export function getLighthouseConfig(port: number) {
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