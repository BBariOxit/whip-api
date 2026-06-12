# Step 1: Build stage
FROM node:18-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install all dependencies including devDependencies (needed for babel build)
RUN npm install

# Copy configuration and source files
COPY .babelrc ./
COPY jsconfig.json ./
COPY src ./src

# Build the project (compiles src to build/src)
RUN npm run build

# Step 2: Production stage
FROM node:18-alpine

WORKDIR /app

# Set production environment variables
ENV BUILD_MODE=production
ENV NODE_ENV=production
ENV PORT=8017

# Copy package files
COPY package*.json ./

# Install only production dependencies
RUN npm ci --only=production

# Copy the built output from the builder stage
COPY --from=builder /app/build ./build

# Expose port
EXPOSE 8017

# Start the application
CMD ["npm", "run", "production"]
