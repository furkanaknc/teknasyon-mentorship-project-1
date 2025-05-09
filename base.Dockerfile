FROM node:18-alpine AS development
RUN apk --no-cache add --update --virtual .builds-deps build-base python3 py3-pip make g++

WORKDIR /src/app

ARG app

RUN echo "Building: $app"

# Copy root package files first
COPY package*.json ./

# Copy the app-specific files
COPY src/apps/${app} ./src/apps/${app}

# Install dependencies with legacy peer deps for compatibility
RUN npm install --legacy-peer-deps
RUN cd ./src/apps/${app} && npm install --legacy-peer-deps

# Don't copy tsconfig files here since we're mounting them from volumes
# COPY tsconfig*.json ./
COPY nest-cli.json ./

# Try to build the app directly from the app directory
RUN cd ./src/apps/${app} && npm run build || echo "Build failed but continuing"

FROM node:18-alpine AS production

ARG NODE_ENV=production
ENV NODE_ENV=${NODE_ENV}

ARG app

RUN echo "Building: $app"

WORKDIR /src/app

# Copy app-specific files
COPY src/apps/${app}/package*.json ./
COPY src/apps/${app} ./

# Install production dependencies
RUN npm ci --only=production --legacy-peer-deps

# Copy the compiled app from development stage
COPY --from=development /src/app/src/apps/${app}/dist ./dist

EXPOSE 3000

CMD ["node", "dist/main.js"]
