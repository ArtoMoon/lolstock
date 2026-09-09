# AI Guidelines - Next.js & MongoDB Riot API Stock Checker

This document defines strict architectural rules, API rate-limit constraints, Next.js conventions, and documentation standards for AI assistants working on this project.

---

## 1. Core Stack & Architecture Rules
* **Project Purpose:** Next.js-based inventory & stock tracker for ~50 League of Legends accounts using Riot Games API and MongoDB.
* **Tech Stack:** Next.js (App Router, Server Actions / Route Handlers), MongoDB with Mongoose, and Tailwind CSS.
* **Strict Line Limit:** No single source or component file may exceed **500 lines**. Separate logic into `/lib/riot`, `/lib/db`, `/models`, `/app/api`, and `/components`.

---

## 2. Next.js & MongoDB Guidelines
* **Database Connections:** Always use a cached global Mongoose connection pattern (`lib/db/mongoose.js`) to avoid creating new connections on hot reloads or serverless invocations.
* **Server-Side API Operations:** Execute all Riot API calls server-side (Server Actions or API Route Handlers). NEVER expose `RIOT_API_KEY` to the client.
* **Data Schemas:** Maintain a clean `Account` Mongoose schema storing `riotId`, `puuid`, `level`, `rank`, `lastMatchId`, `status` (`in_stock`, `sold`, `active`), and `lastCheckedAt`.

---

## 3. Strict Riot API & Rate-Limit Protocol
* **Rate Limits:** Respect the 20 req/10s and 100 req/2min limits.
* **Batch Delay Loop:** When iterating through accounts for a full stock check, enforce an explicit `await delay(1500)` (1.5–2.0 seconds) between requests to prevent HTTP 429 errors.
* **Header Inspection:** Check `X-App-Rate-Limit-Count` and `Retry-After`. Dynamically halt or delay requests if limit caps are approached.
* **Database-First Caching Strategy:**
  * **PUUID:** Permanent in MongoDB (never re-fetch `account-v1` once `puuid` is mapped).
  * **Level & Rank:** Update MongoDB records and cache for 6–12 hours.
  * **Match History (`match-v5`):** Fetch only the latest match ID (`count=1`). If `lastMatchId` changes or level spikes, flag status as `sold` or `active`.

---

## 4. Code Quality & Safety Rules
* **No Unsolicited Edits:** Modify ONLY the target function or route. Do not touch or refactor working adjacent code.
* **Resilient Loop Handling:** A single account lookup failure must NOT crash the global loop. Catch errors per account, mark as `error_checking`, log, and continue the queue.
* **Environment Variables:** API keys and `MONGODB_URI` MUST be loaded securely via `.env.local`.

---

## 5. Documentation Quality & Self-Grading (10-Point Rule)
* **Doc Requirement:** Every API handler, MongoDB helper function, and Server Action MUST include clear JSDoc comments.
* **Self-Grading Benchmark:**
  * AI must self-evaluate documentation on a **1-10 scale**.
  * Documentation MUST score at least **8/10**. If below 8, automatically rewrite and expand before delivering the code.
* **Doc Scope:** State expected parameters, Riot API endpoints called, database mutations, and rate-limit weights.

---

## 6. Testing & Verification
* **Connection Resilience:** Test database reconnection logic under edge runtime vs node runtime conditions.
* **Rate Limit Fail-Safe Tests:** Mock HTTP 429 scenarios to ensure the system gracefully pauses without dropping queued accounts.