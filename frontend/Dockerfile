
# ==========================================
# Stage 1: Build React Application
# ==========================================
FROM node:22-alpine AS build

WORKDIR /helpdesk-frontend

# Install dependencies using lockfile
COPY package*.json ./

RUN npm ci

# Copy application source
COPY . .

# Build React application for production
RUN npm run build

# ==========================================
# Stage 2: Serve React with Nginx
# ==========================================
FROM nginx:alpine

# Copy production build from Node stage
COPY --from=build /helpdesk-frontend/dist /usr/share/nginx/html

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Expose HTTP port
EXPOSE 80

# Start Nginx in the foreground
CMD ["nginx", "-g", "daemon off;"]
