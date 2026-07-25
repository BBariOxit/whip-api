# Step 1: Build stage
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install exactly the dependencies recorded in package-lock.json.
# Dev dependencies are required here for the Babel build.
RUN npm ci

# Copy configuration and source files
COPY .babelrc ./
COPY jsconfig.json ./
COPY src ./src

# Build the project (compiles src to build/src)
RUN npm run build

# Step 2: Production stage
FROM node:20-alpine

WORKDIR /app

# Set production environment variables
ENV BUILD_MODE=production
ENV NODE_ENV=production
ENV PORT=8017

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --omit=dev

# Copy the built output from the builder stage
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 8017

# Start the application
CMD ["node", "build/src/server.js"]

