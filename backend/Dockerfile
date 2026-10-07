FROM node:20-bookworm-slim

# Install system compilers for sandboxed execution (Python, C, C++, Java)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    gcc \
    g++ \
    default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm ci --only=production

COPY . .

EXPOSE 8765

CMD ["node", "server.js"]
