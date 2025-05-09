FROM node:18-alpine

WORKDIR /app

# Copy package.json and install dependencies
COPY src/apps/profile/package*.json ./
RUN npm install --legacy-peer-deps

# Copy app source
COPY src/apps/profile/ ./

# Add Redis configuration to .env if it doesn't exist
RUN if ! grep -q "REDIS_URL" .env 2>/dev/null; then \
      echo "\nREDIS_URL=redis://cache:6379\nREDIS_TTL=3600" >> .env; \
    fi

EXPOSE 3003

CMD ["npm", "run", "start:dev"]
