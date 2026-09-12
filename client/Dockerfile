# Stage 1: build the static assets
FROM node:20-alpine AS build
WORKDIR /app

COPY package*.json ./
RUN npm install
COPY . .
# Vite reads VITE_* env vars at build time, so they must be passed as build args.
ARG VITE_API_URL
ARG VITE_SOCKET_URL
ENV VITE_API_URL=$VITE_API_URL
ENV VITE_SOCKET_URL=$VITE_SOCKET_URL
RUN npm run build

# Stage 2: serve with nginx — final image has no Node.js or source code in it
FROM nginx:1.27-alpine
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
