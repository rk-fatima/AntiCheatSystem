# 🏆 Project Report & Walkthrough: AntiCheat Coding Examination Platform
> **Prepared for**: Teammate Technical Walkthrough & Evaluation  
> **Repository**: [https://github.com/rk-fatima/AntiCheatSystem.git](https://github.com/rk-fatima/AntiCheatSystem.git)  
> **Author**: `mohammedsalman080405-spec` (`mohammedsalman080405@gmail.com`)  
> **Target Concurrency**: 500+ Simultaneous Contestants  

---

## 📌 Executive Summary (The Elevator Pitch)

We upgraded the project from an old, single-file HTML prototype (`qubit-auctioneer (2).html`) into a **production-ready, full-stack, enterprise-grade contest platform**. 

The legacy prototype had three fatal flaws:
1. It depended on an external public Japanese API (`wandbox.org`), which IP-bans callers after ~30 requests.
2. It stored secret test cases and answers in cleartext in browser memory, making it easy to cheat by opening browser DevTools (`F12`).
3. It would completely crash if more than 15 contestants took the contest at the same time.

Our new architecture introduces:
* **High-Performance React 18 + Vite Frontend** with a Cyberpunk dark-mode exam UI.
* **Internal Multi-Compiler Sandboxed Runner** supporting Python 3, C, C++, and Java with a FIFO concurrency queue.
* **Auction Economy Engine**: Teams start with **1,000 points**. Unlocking problems deducts points (**100 for Easy**, **150 for Medium**, **200 for Hard**).
* **93 Real LeetCode Problems** categorized into **`E1`–`E71`**, **`M1`–`M21`**, and **`H1`**.
* **Zero-Typing Testing Tools**: A 1-click **"⚡ Load Solution"** button and a **"Paste Allowed/Blocked"** toggle for rapid testing and grading.
* **Live Proctoring & Telemetry**: WebSocket-backed real-time monitor tracking tab switches, fullscreen exits, and shortcut violations with remote station unlocking.

---

## 🔍 1. Key Problems Solved (Old Prototype vs. New Platform)

| Feature | Legacy Prototype (`qubit-auctioneer (2).html`) | Our New Full-Stack Platform |
| :--- | :--- | :--- |
| **Code Grading** | Sent requests to public `wandbox.org` in a browser loop. | Native sandboxed worker queue (`backend/queue.js` + `runner.js`) running compilers locally. |
| **Capacity** | Wandbox throttled & banned IPs after 30 requests (< 15 contestants). | Scaled for **500+ concurrent contestants** with job throttling and reverse proxy buffering. |
| **Test Case Security** | Hidden test cases and expected outputs were stored in client variables (`p.ht`, `p.eo`). | Hidden test cases reside **strictly server-side**. Contestants only see public sample tests. |
| **Anti-Cheat Enforcement** | Stored violations in `localStorage`, easily modified by contestants. | Real-time telemetry sent over REST and WebSockets; locks are server-verified. |
| **Economy & Problems** | Mock dummy questions ("Sum of Array"). | **93 LeetCode problems** with tiered IDs (`E1..E71`, `M1..M21`, `H1`) and 1,000 initial point balance. |
| **Zero-Typing Testing** | Contestants had to write code from scratch every test run. | **⚡ Load Solution** auto-fills working code instantly for all 4 languages. |

---

## 🏗️ 2. High-Level System Architecture

```text
                        [ 500 Contestants (React 18 SPA) ]
                                        │
                           HTTPS & WebSockets (WSS)
                                        │
                          [ Nginx Reverse Proxy: 80/443 ]
                          ├─ Gzip Static Chunks (~59 KB)
                          └─ Rate Limiter (5 req/sec burst)
                                        │
                          [ Backend Server (Node.js: 8765) ]
                          ├─ Express REST API
                          ├─ WebSocket Telemetry Hub
                          └─ In-Memory Store + database.sql
                                        │
                      [ Asynchronous Priority Queue (queue.js) ]
                      ├─ Concurrency Pool: 4–8 Workers
                      └─ Return immediate { jobId } handle
                                        │
                     [ Multi-Language Sandboxes (runner.js) ]
                     ├─ Python 3 (python3)
                     ├─ C / C++ (gcc / g++ with -O2)
                     └─ Java (javac / java with -Xmx256m)
```

---

## 👥 3. Shared Team Workspace & Dynamic Problem Pricing

### A. Team Collaboration Architecture
```text
                   TEAM (e.g. SYNORA)
                    │
         ┌──────────┴──────────┐
         │                     │
  SHARED WORKSPACE        TEAM MEMBERS
         │               ┌─────┼─────┐
         │               ↓     ↓     ↓
         │            SYNORA-01  SYNORA-02  SYNORA-03
         │           (Member A) (Member B) (Member C)
    ┌────┼────┬────┐
    ↓    ↓    ↓    ↓
   E1   E2   M1   M2
```
* **Team Registration**: Teams register with **1 to 3 members**, nominating a **Captain**. Each member provides Full Name, Roll Number, Phone, Email, and College.
* **Member IDs**: Formatted automatically (e.g., `SYNORA-01`, `SYNORA-02`, `SYNORA-03`).
* **Shared Active Workspace**: All members of `SYNORA` see the same active problems in real time:
  * When Member A unlocks `E3`, `E3` immediately appears in the workspace of Member B and Member C.
  * When Member A solves `E1`, the workspace updates in real time for everyone to:
    ```text
    E1 — Two Sum
    ✅ SOLVED
    Solved by SYNORA-01
    ```
  * When Member B starts working on `E2`, teammates see:
    ```text
    E2 — Palindrome Number
    🟡 IN PROGRESS
    Being worked on by SYNORA-02
    ```

### B. Offline Auction Bidding & Winning Bid Unlock
* **Offline Bidding**: The bidding is conducted manually/offline by the organizer (in the hall or Discord).
* **Winning Bid Amount**: When the auction concludes, the winning team member enters the final agreed bid amount (₹) in the system.
* **Shared Budget Deduction**:
  * Each team starts with a fixed shared budget of **₹1,000**.
  * The entered bid amount is deducted from the team balance:
    $$\text{Remaining Budget} = \text{Current Balance} - \text{Winning Bid}$$
  * Example: Team balance is ₹1,000 $\rightarrow$ Member 3 enters bid ₹300 for `E1` $\rightarrow$ Remaining balance becomes ₹700 for the entire team.
* **Instant Shared Unlock**: The problem becomes available immediately to all members of that team in their shared workspace.
* **Immutable Transaction History**:
  * Every transaction permanently records:
    `{ Team ID, Problem ID, Winning Bid Amount, Bidder Member ID, Remaining Balance, Timestamp }`.
* **Catalog Distribution**:
  * **71 Easy**, **21 Medium**, and **1 Hard** problem.
  * Teams must coordinate so as not to exhaust their ₹1,000 budget on low-point Easy questions when Medium/Hard questions yield higher leaderboard scores.

---

## ⚡ 4. Developer & Proctor Productivity Features

To enable instant grading and testing without manual typing:
1. **⚡ Load Solution Button**:
   * Located directly above the code editor.
   * Clicking it instantly populates optimal working code for the active problem in whichever language is selected (Python, C++, or Java).
2. **🔓 Paste Toggle (`Paste: Blocked` / `Paste: Allowed`)**:
   * Allows proctors and evaluators to copy-paste code snippets during demonstrations or testing sessions without triggering anti-cheat penalties.
3. **Execution Terminal**:
   * Shows compilation warnings, runtime errors, standard output, execution time, and peak memory usage.

---

## 🛡️ 5. Multi-Layer Anti-Cheat Proctoring Engine

1. **Mandatory Fullscreen Gate**: Students must enter fullscreen before accessing the questions.
2. **Tab Switch & Window Blur Tracking**: Detects when contestants alt-tab or click off the exam window.
3. **DevTools & Shortcut Shielding**: Blocks `F12`, `Ctrl+Shift+I`, `Cmd+Option+I`.
4. **Auto-Lockout**: If a student accumulates 3 strikes, the screen locks with a secure PIN entry overlay.
5. **Real-Time Proctor Dashboard**:
   * Proctors can open the dashboard using PIN `qubit`.
   * Live risk scoring across all teams (🟢 Normal, 🟡 Suspicious, 🔴 Critical).
   * Proctors can remotely unlock any locked station with one click over WebSockets.

---

## 📁 6. Project Structure

```text
AntiCheatSystem/
├── README.md                    # Platform documentation, project tree & deployment guide
├── TEAM_REPORT.md               # Detailed teammate walkthrough & technical explanation
├── database.sql                 # PostgreSQL production schema & performance indexes
├── docker-compose.yml           # Multi-container orchestration (Nginx, API, DB, Redis)
├── nginx.conf                   # Reverse proxy, gzip, WebSocket & submission rate-limiting
├── package.json                 # Root npm scripts (start, build, dev:backend, dev:frontend)
├── qubit-problems.json          # Root mirror of the 93-problem catalog
│
├── frontend/                    # High-Performance React 18 + Vite SPA
│   ├── package.json             # Frontend dependencies (React, Lucide-react, Vite)
│   ├── vite.config.js           # Vite dev proxy configuration (/api & /ws)
│   ├── index.html               # SPA entry point with Google Fonts
│   └── src/
│       ├── main.jsx             # React DOM root mounting
│       ├── index.css            # Cyberpunk dark mode design system & scrollbars
│       ├── App.jsx              # Master application controller & state manager
│       │
│       ├── components/          # Modular React UI Components
│       │   ├── Header.jsx       # Real-time stats, team badge, fullscreen & proctor shortcuts
│       │   ├── ProblemCatalog.jsx # 93-problem auction catalog with 1-click unlock & search
│       │   ├── CodeEditorPane.jsx # Line gutter editor, stdin, live terminal & solution loader
│       │   ├── GateModal.jsx    # Mandatory fullscreen exam entrance modal
│       │   ├── LockOverlay.jsx  # Anti-cheat lockout screen with organiser PIN unlock
│       │   ├── ProctorDashboard.jsx # Real-time judge monitor for 500 teams & remote unlock
│       │   └── LeaderboardModal.jsx # Live ranked scoreboard sorted by points and penalties
│       │
│       ├── hooks/
│       │   └── useAntiCheat.js  # Telemetry hook (fullscreen, blur, tab switch, paste guard)
│       │
│       └── services/
│           └── api.js           # Asynchronous REST & WebSocket client service
│
└── backend/                     # Asynchronous Queue & Sandboxed Execution Server
    ├── package.json             # Express, WebSocket, CORS dependencies
    ├── Dockerfile               # Multi-compiler container (Node.js, GCC, G++, OpenJDK, Python)
    ├── server.js                # Express REST API, static SPA server & WebSocket hub
    ├── database.js              # In-memory + atomic JSON store & flexible problem lookup
    ├── queue.js                 # Concurrency-limited asynchronous submission queue
    ├── runner.js                # Native sandboxed execution engine (Python, C, C++, Java)
    └── data/
        ├── qubit-problems.json  # Master bank of 93 problems (Easy, Medium, Hard)
        └── store.json           # Atomic database store (teams, balances, audit logs)
```

---

## 🗣️ 7. Teammate Walkthrough Script (How to Present)

Use these talking points when walking your teammate through the project:

1. **The Starting Point**:
   > *"We started with `qubit-auctioneer (2).html`, which had all code, CSS, and logic in one file. It relied on a free Japanese service called Wandbox to run code. For 500 students, Wandbox would instantly rate-limit us, and contestants could inspect secret test cases in developer tools."*

2. **The Backend & Runner**:
   > *"We created `backend/runner.js` and `backend/queue.js`. The runner executes Python, C, C++, and Java directly on the server with sandbox constraints (3-second timeouts, buffer limits). The queue processes submissions asynchronously so the server never freezes."*

3. **The Auction Economy & 93 Problems**:
   > *"We removed the old mock problems and added 93 standard LeetCode problems categorized as `E1`–`E71` (100 pts), `M1`–`M21` (150 pts), and `H1` (200 pts). Each team gets a starting balance of 1,000 points. When they unlock a problem, the points are deducted and the problem appears in their active workspace."*

4. **Testing Without Typing**:
   > *"For fast testing and grading, we added a 'Load Solution' button that autofills the correct solution in Python, C++, or Java with 1 click, plus a toggle to allow or block pasting."*

5. **Proctoring & Anti-Cheat**:
   > *"We built an anti-cheat engine in `useAntiCheat.js` and a proctor dashboard. It tracks fullscreen exits and tab switching. If a student gets 3 strikes, their station locks automatically and only a proctor can unlock it."*
