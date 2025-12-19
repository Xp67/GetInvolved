# Build stage
FROM node:20-alpine AS builder
WORKDIR /app

# Accept API URL at build time so it can be baked into the bundle
ARG VITE_API_URL
ENV VITE_API_URL=${VITE_API_URL}

COPY package*.json ./
RUN npm ci
COPY . .

# Ensure local development env files don't leak into production builds
RUN rm -f .env

RUN npm run build

# Production stage
FROM node:20-alpine AS runner
WORKDIR /app
RUN npm install -g serve
COPY --from=builder /app/dist ./dist
ENV PORT=3000
EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]
