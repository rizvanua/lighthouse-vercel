# Lighthouse API

A serverless API for running Lighthouse audits on websites, deployed on Vercel.

## Project Structure

```
lighthouse-vercel/
├── api/                      # API directory
│   ├── analyze.ts            # Main analyze endpoint
│   ├── package.json          # API dependencies
│   ├── tsconfig.json         # TypeScript configuration
│   ├── utils/                # Utility functions
│   │   ├── analyzeUrl.ts     # Lighthouse analysis function
│   │   ├── browser.ts        # Browser launch utilities
│   │   ├── lighthouseConfig.ts # Lighthouse configuration
│   │   └── setHeaders.ts     # CORS headers utility
│   └── types/                # Type definitions
│       ├── lighthouse.d.ts   # Lighthouse type definitions
│       └── vercel.d.ts       # Vercel type definitions
└── vercel.json               # Vercel deployment configuration
```

## Features

- Run Lighthouse audits on any website
- Serverless architecture deployed on Vercel
- CORS enabled for cross-origin requests
- Returns key performance metrics (LCP, TTFB)

## API Endpoints

### Analyze URL

```
POST /api/analyze
Content-Type: application/json

{
  "url": "https://example.com"
}
```

Analyzes a website using Lighthouse and returns performance metrics.

**Response:**
```json
{
  "results": {
    "success": true,
    "url": "https://example.com",
    "lcp": 2.5,
    "ttfb": 0.8,
    "report": { ... }
  }
}
```

## Local Development

### Prerequisites

- Node.js = 22.x
- Vercel CLI (`npm install -g vercel`)

## Deployment

This project is configured for deployment on Vercel. To deploy:

```bash
vercel --prod
```

## Environment Variables

No environment variables are required for basic functionality.

## Technologies Used

- TypeScript
- Lighthouse
- Puppeteer Core
- Vercel Serverless Functions

## Limitations

- Maximum execution time: 60 seconds (Vercel serverless function limit)
- Memory: 1024MB (Vercel serverless function limit)
- Node.js version: 22.x.x
