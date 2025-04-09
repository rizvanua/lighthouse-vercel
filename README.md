# Lighthouse Performance Analyzer


<img width="596" alt="Screenshot 2025-04-09 at 18 47 14" src="https://github.com/user-attachments/assets/ac5a58a9-6f23-473a-aee5-6ccb4f9eb4f1" />



A Docker-based web application that provides a user-friendly interface for running Google Lighthouse performance audits on any website. The project consists of two main services:

1. **Lighthouse Runner Service**: A Node.js service that runs Lighthouse audits using Chromium
2. **React UI Service**: A modern web interface built with React and Material-UI

## Features

- 🚀 Easy-to-use web interface for running Lighthouse audits
- 📊 Real-time performance metrics (LCP, TTFB)
- 📥 Downloadable detailed Lighthouse reports
- 🔄 Containerized setup for easy deployment
- 🎨 Modern Material-UI design
- 🔍 Support for any public website
- ⚡ Parallel analysis of up to 2 URLs simultaneously

## Prerequisites

- Docker
- Docker Compose

## Quick Start

1. Clone the repository:
```bash
git clone <repository-url>
cd lighthouse-runner
```

2. Build and start the services:
```bash
docker-compose up --build
```

3. Open your browser and navigate to:
```
http://localhost:80
```

## Architecture

### Services

- **Lighthouse Runner** (Port 3090)
  - Node.js service running Lighthouse audits
  - Uses Chromium for headless browser testing
  - RESTful API endpoints for analysis
  - Supports parallel analysis of up to 2 URLs

- **React UI** (Port 80)
  - Modern web interface
  - Built with React and Material-UI
  - Nginx server for static file serving
  - Proxies API requests to Lighthouse service

### API Endpoints

- `POST /analyze`
  - Request body: `{ "urls": ["https://example.com", "https://example.org"] }`
  - Returns: Lighthouse analysis results for up to 2 URLs
  - Example response:
    ```json
    {
      "results": [
        {
          "url": "https://example.com",
          "success": true,
          "lcp": 1234,
          "ttfb": 567,
          "reportPath": "/app/reports/example_com_report.html"
        }
      ]
    }
    ```

- `GET /health`
  - Health check endpoint
  - Returns: `{ "status": "healthy" }`

## Development

### Project Structure

```
lighthouse-runner/
├── lighthouse-app/          # Lighthouse service
│   ├── src/                # TypeScript source files
│   ├── dist/               # Compiled JavaScript files
│   ├── reports/            # Generated Lighthouse reports
│   ├── package.json        # Node.js dependencies
│   ├── tsconfig.json       # TypeScript configuration
│   └── Dockerfile         # Lighthouse service container
├── lighthouse-ui/          # React UI service
│   ├── src/               # React source files
│   ├── public/            # Static assets
│   ├── package.json       # React dependencies
│   ├── nginx.conf         # Nginx configuration
│   └── Dockerfile        # UI service container
└── docker-compose.yml     # Docker services configuration
```

### Building from Source

1. Build the Lighthouse service:
```bash
cd lighthouse-app
npm install
npm run build
```

2. Build the React UI:
```bash
cd lighthouse-ui
npm install
npm run build
```

3. Start the services:
```bash
docker-compose up --build
```

## Usage

1. Open the web interface at `http://localhost:80`
2. Enter up to 2 URLs you want to analyze
3. Click "Analyze" to start the Lighthouse audits
4. View the results including:
   - Largest Contentful Paint (LCP)
   - Time to First Byte (TTFB)
   - Download the full Lighthouse report

## Troubleshooting

### Common Issues

1. **Chrome/Chromium not found**
   - Ensure the Docker container has the correct Chrome dependencies installed
   - Check the `CHROME_PATH` environment variable

2. **TypeScript compilation errors**
   - Verify that the source files are in the correct location (`src/` directory)
   - Check the `tsconfig.json` configuration

3. **Docker volume issues**
   - The `dist/` and `node_modules/` directories are mounted as anonymous volumes
   - Only the `reports/` directory is shared with the host

## Contributing

1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
