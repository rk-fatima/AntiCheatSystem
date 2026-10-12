FROM node:20-bookworm-slim

# Install system compilers for sandboxed code execution (Python, C, C++, Java)
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    gcc \
    g++ \
    default-jdk-headless \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy backend package files and install dependencies
COPY backend/package*.json ./backend/
RUN cd backend && npm install --omit=dev

# Copy backend source code
COPY backend/ ./backend/

WORKDIR /app/backend

# Default PORT to 8765 if not provided by cloud platform (Railway dynamically sets PORT)
ENV PORT=${PORT:-8765}
EXPOSE ${PORT}

CMD ["node", "server.js"]
