declare module 'lighthouse' {
  interface LighthouseResult {
    lhr: {
      audits: {
        [key: string]: {
          numericValue?: number;
        };
      };
    };
  }

  interface LighthouseOptions {
    port: number;
    output: string;
    logLevel: string;
    onlyCategories?: string[];
    formFactor?: string;
    screenEmulation?: {
      mobile: boolean;
      width: number;
      height: number;
      deviceScaleFactor: number;
      disabled: boolean;
    };
  }

  function lighthouse(url: string, options: LighthouseOptions): Promise<LighthouseResult>;
  export = lighthouse;
} 