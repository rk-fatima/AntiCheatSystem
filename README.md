# Qubit AntiCheat & Contest System 🚀

A scalable, secure, and production-ready online coding examination platform engineered to comfortably support **500+ concurrent contestants** with real-time proctoring and automated code grading.

---

## 🌟 Why These Upgrades Were Made

The original single-file prototype (`qubit-auctioneer (2).html`) suffered from critical vulnerabilities and bottlenecks under concurrent load:
1. **Public API Exhaustion**: It relied on calling Wandbox sequentially in browser loops; 500 users submitting code generated ~2,000 requests per burst, leading to immediate rate-limiting and IP bans.
2. **Hidden Test Leakage**: Hidden tests and expected outputs were transmitted directly to the client browser's memory, making cheating trivial via browser DevTools.
3. **Client-Side Anti-Cheat Bypass**: Flags and admin PINs were stored in `localStorage`, which could be altered or bypassed using the browser console.
4. **State Destruction on Reload**: Refreshing the browser wiped out participant scores and solved problems.

---

## 🏗️ New Architecture Overview

```
                      [ 500 Contestants (React.js SPA) ]
                                      │
                         HTTPS & WebSockets (WSS)
                                      ▼
                      [ Nginx Edge Proxy & Rate Limiter ]
                         (Gzip, Burst Limits, SSL)
                                      │
                   ┌──────────────────┴──────────────────┐
                   ▼                                     ▼
      [ Express API & Telemetry Hub ]      [ Real-time Proctor Dashboard ]
         (JWT Auth, Telemetry, Logs)           (Live Feed & Remote Unlock)
                   │
         ┌─────────┴─────────┐
         ▼                   ▼
   [ PostgreSQL ]      [ Redis / Async Queue ]
  (Persistent Data)    (Concurrency Limited: 4-8 parallel jobs)
                             │
                             ▼
               [ Sandboxed Multi-Language Runner ]
               (Python, C, C++, Java · 256MB · 3.0s Timeout)
```

---

## ⚡ Key Improvements

### 1. High-Performance React.js Frontend (Replacing Static HTML)
* **Sub-50ms Initial Load**: Built with **Vite + React 18**, producing optimized, minified, gzip-compressed chunks (`~58 KB` total bundle size).
* **Cyberpunk Exam UI**: Dark mode theme with glowing neon indicators, stat counters, and responsive split-pane layout.
* **Custom Code Editor**:
  * Line number gutter synchronized with scrolling.
  * Tab key support (4-space indentation).
  * Starter templates for **Python 3, C, C++, and Java**.
  * Dynamic execution terminal showing live worker queue progress (`QUEUED` ➔ `RUNNING` ➔ `RESULT`).

### 2. Multi-Layer Anti-Cheat Proctoring Engine (`useAntiCheat`)
* **Fullscreen Lockdown**: Automatically prompts for fullscreen and logs any departures.
* **Tab Switch & Focus Detection**: Detects `visibilitychange` and window `blur` events.
* **Shortcut Interceptor**: Blocks `F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U`, `Ctrl+S`, `Ctrl+P`.
* **Clipboard & Paste Guard**: Detects and blocks external code insertion while allowing internal copy/paste within the editor.
* **Server-Enforced Lockout**: If a participant accumulates 3 or more violation flags, their screen locks automatically. Resuming requires an admin override or remote unlock from the proctor.

### 3. Server-Side Sandboxed Evaluation & Queueing
* **Hidden Test Isolation**: Hidden test cases and expected outputs are **never sent to the client**.
* **Asynchronous Queue**: Execution requests return immediately with `{ jobId, status: "QUEUED" }`, preventing HTTP worker exhaustion.
* **Strict Sandboxing**:
  * Execution timeout: `3.0 seconds`
  * Process output limit: `64 KB` (prevents memory attacks or infinite print loops)
  * Isolated temporary directories cleaned up automatically after execution.

### 4. Organiser & Proctor Real-Time Dashboard
* Open via the ⚙️ gear icon in the header.
* **Live Contestant Monitoring**: View all 500 teams, active sessions, and flagged participants in real time.
* **One-Click Remote Unlock**: Proctors can unfreeze a locked participant's station remotely without leaving their desk.
* **Audit Trail**: Detailed timeline of all flagged events per team.
* **Live Leaderboard**: Real-time scoring ranked by points and solve attempts.

---

## 🚀 Quickstart Guide

### Method 1: Local Development (Fastest)

#### 1. Start the Backend API & Runner:
```bash
cd backend
npm install
npm start
```
*The server will start on `http://localhost:8765`.*

#### 2. Start the React Frontend:
```bash
cd frontend
npm install
npm run dev
```
*Open `http://localhost:3000` in your browser.*

---

### Method 2: Single-Command Production Build

You can build the React frontend and let the backend serve it as a production SPA:

```bash
# 1. Build React production bundle
cd frontend && npm run build && cd ..

# 2. Run backend server (serves both API and React frontend)
npm start
```
*Access the application at `http://localhost:8765`.*

---

### Method 3: Multi-Node Docker Deployment (500 Concurrent Users)

To deploy with Nginx, PostgreSQL, Redis, and Sandboxed Workers:

```bash
docker compose up -d --build
```
* Access the contestant portal at `http://localhost`.
* Access the backend directly at `http://localhost:8765`.

---

## 🔑 Default Credentials

* **Organiser PIN**: `qubit`
* **Default Problem Unlock Keys**:
  * `ALPHA1` — Sum of Array (Easy, 100 pts)
  * `BRAVO2` — Palindrome Check (Medium, 200 pts)
  * `CHARLIE3` — Continuous Subarray Sum (Easy, 100 pts)
  * `DELTA4` — Valid Anagram (Easy, 150 pts)
  * `ECHO5` — The Bounded Auctioneer (Medium, 250 pts)
  * `FOXTROT6` — Longest Non-Repeating Substring (Medium, 300 pts)
  * `GOLF7` — Minimum Bid Adjustments (Hard, 500 pts)
