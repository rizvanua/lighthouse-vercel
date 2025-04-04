FROM node:20-slim

# Install Chrome dependencies and Chromium
RUN apt-get update && apt-get install -y \
  wget curl gnupg unzip fonts-liberation \
  libappindicator3-1 libasound2 libatk-bridge2.0-0 libatk1.0-0 libcups2 \
  libdbus-1-3 libgdk-pixbuf2.0-0 libnspr4 libnss3 libx11-xcb1 libxcomposite1 \
  libxdamage1 libxrandr2 xdg-utils chromium chromium-sandbox --no-install-recommends && \
  apt-get clean && rm -rf /var/lib/apt/lists/*

# Set environment variable for Chrome
ENV CHROME_PATH=/usr/bin/chromium

WORKDIR /app

# Install deps
COPY package*.json ./
RUN npm install

# Copy the app
COPY . .

# Build TypeScript
RUN npm run build

# Create directory for reports
RUN mkdir -p /app/reports

# Expose the port
EXPOSE 3090

# Start the application
CMD ["npm", "run", "start"]

# Default command is in docker-compose.yml
