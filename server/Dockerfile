FROM node:20-alpine AS base
WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev
COPY src ./src

ENV NODE_ENV=production
EXPOSE 5000

# Runs as the non-root 'node' user baked into the official image, not root.
USER node

CMD ["node", "src/server.js"]
