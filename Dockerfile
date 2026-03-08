# Stage 1: Builder
FROM node:20-slim AS builder

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm ci

# Copy TypeScript configuration
COPY tsconfig.json ./

# Copy source code
COPY src/ ./src/

# Build TypeScript to JavaScript
RUN npm run build

# Stage 2: Production
FROM node:20-slim

# Install .NET SDK 8.0
RUN apt-get update && apt-get install -y wget && \
    wget https://dot.net/v1/dotnet-install.sh && \
    chmod +x dotnet-install.sh && \
    ./dotnet-install.sh --channel 8.0 && \
    rm dotnet-install.sh && \
    apt-get remove -y wget && apt-get autoremove -y && \
    rm -rf /var/lib/apt/lists/*

# Add .NET to PATH
ENV PATH="${PATH}:/root/.dotnet"

# Set working directory
WORKDIR /app

# Copy compiled code from builder
COPY --from=builder /app/build ./build

# Copy documentation from builder
COPY --from=builder /app/src/docs ./src/docs

# Copy production node_modules from builder
COPY --from=builder /app/node_modules ./node_modules

# Copy package.json for metadata
COPY package.json ./

# Set entrypoint to run the MCP server via stdio
ENTRYPOINT ["node", "build/index.js"]
