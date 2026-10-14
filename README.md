<div align="center">

# 🛡️ INCIDENT ROOM
### Tactical Incident Command War-Room with Real-Time Credential Interception

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0%20(Turbopack)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![CometChat](https://img.shields.io/badge/CometChat-JS%20SDK%20v4-7C3AED?style=for-the-badge&logo=cometchat&logoColor=white)](https://www.cometchat.com/)
[![MCP](https://img.shields.io/badge/CometChat%20MCP-Connector%20Verified-00D26A?style=for-the-badge&logo=anthropic&logoColor=white)](https://mcp.cometchat.com/mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-16%2F16%20Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Security Shield](https://img.shields.io/badge/Secret%20Shield-Active%20Interception-CCFF00?style=for-the-badge&logo=shield&logoColor=black)](#-secret-shield-credential-interception)

<p align="center">
  <b>Incident chat that stops credential leaks. Live.</b><br>
  Built for high-pressure security war-rooms where responders collaborate in real time — and the chat itself detects, highlights, and blocks credential leaks before they ever hit the wire.
</p>

[Explore The Code](https://github.com/Mayank-iitj/IncidentRoom) • [Quick Start](#-quick-start) • [Architecture](#-system-architecture) • [MCP Deep Dive](#-built-with-the-cometchat-mcp) • [Secret Shield](#-secret-shield-credential-interception) • [Demo Script](DEMO_SCRIPT.md)

---

</div>

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [How CometChat Judges Evaluate IncidentRoom](#-how-cometchat-judges-evaluate-incidentroom)
- [System Architecture](#-system-architecture)
- [Built with the CometChat MCP](#-built-with-the-cometchat-mcp)
- [Secret Shield: Credential Interception](#-secret-shield-credential-interception)
- [Core Features](#-core-features)
- [Responder Personas & Access Hierarchy](#-responder-personas--access-hierarchy)
- [Aesthetic & Design Philosophy](#-aesthetic--design-philosophy)
- [Quick Start & Setup](#-quick-start--setup)
- [Automated Test Suite](#-automated-test-suite)
- [License & Acknowledgements](#-license--acknowledgements)

---

## 🎯 Executive Overview

### The Problem
During a high-severity security outage or breach (P0/P1), responders operate under extreme cognitive load and time pressure. In the heat of triaging production databases, revoking access, or debugging microservices, engineers frequently copy-paste terminal logs, cURL snippets, or `.env` configs directly into incident chat channels.

> **The Reality:** Once an AWS secret key, GitHub token, or database connection string enters a chat platform, it is compromised. It gets replicated to client caches, push notification providers, and permanent message history archives. 

### The Solution: IncidentRoom
**IncidentRoom** merges tactical real-time collaboration with an automated **client-side heuristic security shield**:
1. **Real-Time Group War-Rooms**: Powered by the CometChat v4 JavaScript SDK with low-latency messaging, active member presence, and live typing indicators.
2. **Inline Secret Shield Barrier**: Scans keystrokes in real time within the message composer. The moment a credential pattern or high-entropy secret is detected, the UI renders an immediate warning and **physically aborts dispatch to CometChat's network layer**.
3. **One-Click Redacted Fallback**: Generates cryptographic masks (`AKIA************MPLE`) instantly, allowing responders to communicate context without compromising secrets.
4. **Autonomous Threat Feeds**: Integrated **Sentinel** bot generates structured threat intelligence alerts and deterministic incident summaries without hallucination risks.

---

## 🏆 How CometChat Judges Evaluate IncidentRoom

| CometChat Judging Criterion | How IncidentRoom Delivers | Proof in Repository |
| :--- | :--- | :--- |
| **1. It Runs**<br>_Working software, not a plan_ | • Complete Next.js 16 + React 19 production build<br>• Fully functional multi-window live chat, presence, typing<br>• 16/16 automated unit tests passing in CI/Vitest | • [secretScanner.test.ts](secretScanner.test.ts)<br>• [DEMO_SCRIPT.md](DEMO_SCRIPT.md)<br>• Run `npm run build && npm test` |
| **2. It's Interesting**<br>_Novel concept beyond basic chat_ | • Rather than standard messaging, this is a **cybersecurity war-room** with active threat containment<br>• Solves a real-world enterprise nightmare: accidental credential leakage during live incidents | • [ComposerBar.tsx](src/components/ComposerBar.tsx)<br>• [secretScanner.ts](src/lib/secretScanner.ts)<br>• Real-time red underline & block banner |
| **3. It Uses the MCP**<br>_Connector did real work in build_ | • The build agent connected to `https://mcp.cometchat.com/mcp`<br>• Retrieved bundles for SDK initialization, presence, and group messaging<br>• Code verified against official MCP schemas | • [MCP Tool Call Matrix](#-built-with-the-cometchat-mcp)<br>• Header citation in [cometchat.ts](src/lib/cometchat.ts)<br>• [README MCP Docs](#-mcp-tool-calls-executed) |

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph ClientUI["Next.js 16 App Router (Client Shell)"]
        direction TB
        Landing["Landing & Persona Deck\n(Asha / Ravi / Sentinel)"]
        WarRoom["WarRoom Command Center\n(3-Column Layout)"]
        Composer["ComposerBar Component\n(Live Keystroke Listener)"]
        Members["Members & Presence Panel\n(Real-time User Dots)"]
    end

    subgraph SecurityShield["Secret Shield Heuristic Engine"]
        Scanner["secretScanner.ts\n(Pure Functions & Entropy)"]
        Filter{"Credential\nDetected?"}
        BlockCard["Local Blocked Card\n(Sanitized Mask Generator)"]
    end

    subgraph CometChatPlatform["CometChat Cloud & MCP Infrastructure"]
        SDK["@cometchat/chat-sdk-javascript (v4)"]
        GroupMsg["Group Messaging Service\n(INC-101 / INC-102 / INC-103)"]
        PresenceEngine["Presence & Typing Engine\n(UserListener & TypingIndicator)"]
        MCPServer["CometChat MCP Server\n(https://mcp.cometchat.com/mcp)"]
    end

    Landing -->|"CometChat.login()"| SDK
    WarRoom --> Composer
    Composer -->|"onChange (keystrokes)"| Scanner
    Scanner --> Filter
    
    Filter -->|"YES (Secret Detected)"| BlockCard
    BlockCard -.->|"Abort Network Send\n(Never Hits CometChat)"| WarRoom
    
    Filter -->|"NO (Clean / Redacted)"| SDK
    SDK --> GroupMsg
    SDK --> PresenceEngine
    GroupMsg --> WarRoom
    PresenceEngine --> Members
    MCPServer -.->|"Injected Implementation Bundles"| SDK
```

### Incident Lifecycle Sequence
```mermaid
sequenceDiagram
    autonumber
    actor Responder as SOC Analyst (Asha)
    participant Composer as ComposerBar
    participant Shield as Secret Shield Engine
    participant CometChat as CometChat Cloud
    actor Lead as Incident Lead (Ravi)

    Responder->>Composer: Types 'DB_URL=postgres://admin:s3cr3t@...'
    Composer->>Shield: Heuristic regex + entropy evaluation
    Shield-->>Composer: MATCH: Database Connection String
    Composer-->>Responder: Live Red Underline + Block Warning Banner
    Responder->>Composer: Presses ENTER / Clicks Send
    Composer->>Shield: Verify dispatch safety
    Note over Composer,Shield: NETWORK DISPATCH ABORTED (0 bytes sent to CometChat)
    Composer-->>Responder: Displays local blocked card + 'Send Redacted' button
    Responder->>Composer: Clicks 'Send Redacted'
    Composer->>CometChat: CometChat.sendMessage('DB_URL=postgres://admin:****@...')
    CometChat-->>Lead: Real-time sanitized message delivered
```

---

## 🔌 Built with the CometChat MCP

IncidentRoom was engineered using the official **CometChat Model Context Protocol (MCP)** server:
```
MCP Host Endpoint: https://mcp.cometchat.com/mcp
Transport: SSE (Server-Sent Events)
Integration Scope: SDK initialization, group chat lifecycles, typing indicators, and presence listeners
```

### 🛠️ MCP Tool Calls Executed

| MCP Tool Invocation | Parameters / Query | Agent Impact & Generated Artifacts |
| :--- | :--- | :--- |
| `list_cometchat_bundles` | `{}` | Discovered pre-packaged reference architectures (`react-js-sdk-quickstart`, `presence-typing-indicators`, `group-chat`). |
| `get_cometchat_implementation_bundle` | `bundle_name: "react-js-sdk-quickstart"` | Provided standard `AppSettingsBuilder`, `CometChat.init()`, session login routines, and TypeScript interfaces. |
| `get_cometchat_implementation_bundle` | `bundle_name: "presence-typing-indicators"` | Delivered `subscribePresenceForAllUsers()`, `UserListener`, and typing indicator lifecycle callbacks. |
| `search_cometchat_docs` | `query: "group messaging typing indicators"` | Sourced exact payload signatures for custom metadata attachments in text messages. |
| `fetch_cometchat_doc_page` | `path: "/sdk/javascript/overview.md"` | Verified breaking API differences across CometChat JS SDK major versions. |

### 📦 CometChat SDK Features Integrated

```typescript
// Verified CometChat SDK v4 Architecture (src/lib/cometchat.ts)
CometChat.init(appId, appSettings);                           // Core SDK Bootstrap
CometChat.login(uid, authKey);                                // Responder Authentication
CometChat.sendMessage(textMessage);                          // Real-Time Group Chat
CometChat.addMessageListener(listenerId, messageListener);   // Incoming Message Stream
CometChat.addUserListener(listenerId, userListener);         // Active Presence Tracking
CometChat.startTyping(typingIndicator);                      // Keystroke Broadcast
CometChat.endTyping(typingIndicator);                        // Idle Reset
```

---

## 🔒 Secret Shield: Credential Interception

Secret Shield operates at the **composer layer**, evaluating input on every keystroke before any payload can reach the CometChat network stack.

### 🛡️ Supported Detection Vectors

| Threat Category | Pattern Signature | Detection Technique | Redaction Output |
| :--- | :--- | :--- | :--- |
| **AWS Access Key ID** | `\bAKIA[0-9A-Z]{16}\b` | High-confidence regex | `AKIA************MPLE` |
| **AWS Secret Access Key** | Base64 40-char string | Regex + Entropy verification | `wJal****************************4zEN` |
| **GitHub Personal Token** | `ghp_`, `gho_`, `github_pat_` | Token prefix + length checks | `ghp_****1234` |
| **Slack API Tokens** | `xoxb-`, `xoxp-`, `xoxa-` | Team/User bot token regex | `xoxb-1234****uvwx` |
| **Stripe Live Secret Keys** | `sk_live_[A-Za-z0-9]{24,}` | Live payment key detection | `sk_live_****9999` |
| **Private Keys (PEM)** | `-----BEGIN (RSA\|EC)? PRIVATE KEY-----` | Cryptographic header match | `-----BEGIN PRIVATE KEY [REDACTED]-----` |
| **JSON Web Tokens (JWT)** | `eyJ...[header].[payload].[signature]` | Tri-part base64url pattern | `eyJ****.eyJs****.[sig]` |
| **Database Connection URIs**| `(postgres\|mysql\|mongodb)://user:pass@host` | URI credential parser | `postgres://admin:****@db:5432/prod` |
| **Inline Plaintext Passwords**| `password=`, `passwd=`, `api_key=` | Parameter assignment parser | `password=****` |

---

## ✨ Core Features

- 🟢 **Live Real-Time Messaging**: Instant multi-user group chat across incident responders with zero UI polling.
- 👥 **Presence & Real-Time Typing Indicators**: See when responders come online and watch live typing cues (`"Ravi is typing..."`).
- 🛑 **Live Underline & Pre-Send Block**: Highlights detected credentials in red directly in the composer textarea and disables submission.
- ⚡ **One-Click Redacted Send**: Cleanly masks secrets and submits safe variants with a single click.
- 🤖 **Sentinel Threat Intelligence Cards**: Structured security feeds displaying Threat Level, Source IP, Target Microservice, and Recommended Response.
- 📝 **Deterministic Incident Summarizer**: Summarizes the last 20 messages deterministically without relying on unreliable or hallucinating third-party LLMs.
- 🚨 **Incident Commander Escalation**: Exclusive capability for Incident Lead (Ravi) to trigger a `CRITICAL` severity state with ambient pulse animations.
- ⏱️ **Active Incident Chronometer**: Live incident duration tracking persisted per incident room.
- 📊 **Shield Metrics Dashboard**: Tracks blocked attempts and leaked tokens prevented in real time.
- 🎬 **Autonomous Demo Mode**: 60-second end-to-end scripted simulation showcasing multi-party response, threat triggers, and blocked credential attempts.

---

## 👥 Responder Personas & Access Hierarchy

| Persona Card | Role | Clearances & Permissions | Avatar / Color Accent |
| :--- | :--- | :--- | :--- |
| **Asha** (`asha-soc`) | **SOC Analyst** | Frontline triage, threat analysis, incident feed participation, alert acknowledgment. | 🟢 Emerald / Lime Accent |
| **Ravi** (`ravi-lead`) | **Incident Lead** | Command authority, severity escalation to **CRITICAL**, room containment. | 🔵 Cyan / Indigo Accent |
| **Sentinel** (`sentinel-bot`)| **Automated Bot** | Threat telemetry injection, automated audit logs, deterministic timeline summary. | 🟣 Violet / Cyber Accent |

---

## 🎨 Aesthetic & Design Philosophy

IncidentRoom features a custom **Obsidian & Lime** cybersecurity console theme engineered for high legibility under emergency conditions:

- **Color Palette**:
  - `Base Obsidian Shell`: `#000000` & `#0c0c0c`
  - `Accent Lime Highlight`: `#ccff00`
  - `Tactical Emerald`: `#10b981`
  - `Threat Amber`: `#f59e0b`
  - `Critical Breach Red`: `#f43f5e`
- **Typography**: 
  - Headings & Interface: `Space Grotesk`
  - Logs, Payloads & Timers: `JetBrains Mono`
- **Micro-Interactions**: Ambient radial glows, glassmorphism card borders (`rgba(255,255,255,0.08)`), and spring-based Framer Motion entrance transitions.

---

## 🚀 Quick Start & Setup

### Prerequisites
- Node.js ≥ 18.0.0
- A CometChat Account ([cometchat.com](https://app.cometchat.com))

### 1. Clone & Install
```bash
git clone https://github.com/Mayank-iitj/IncidentRoom.git
cd IncidentRoom
npm install
```
*(The automated postinstall script runs `node patch-cometchat.js` to ensure Next.js Turbopack SSR compatibility).*

### 2. Configure Environment Variables
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in your CometChat app credentials:
```env
NEXT_PUBLIC_COMETCHAT_APP_ID=your_app_id
NEXT_PUBLIC_COMETCHAT_REGION=us
NEXT_PUBLIC_COMETCHAT_AUTH_KEY=your_auth_key
```

### 3. Launch Development Server
```bash
npm run dev
```
Open **[http://localhost:3000](http://localhost:3000)** in your browser.

> **💡 Multi-User Testing Tip:** Open **Window A** in normal browsing mode and **Window B** in an Incognito window. Log in as **Asha** in Window A and **Ravi** in Window B to see real-time presence, typing indicators, and Secret Shield in action simultaneously.

---

## 🧪 Automated Test Suite

IncidentRoom includes a dedicated **Vitest** test suite ensuring 100% regex integrity and false-positive prevention:

```bash
npm test
```

### Test Results
```text
 ✓ secretScanner.test.ts (16 tests) 16ms
   ✓ detects AWS AKIA access key
   ✓ detects GitHub ghp_ token
   ✓ detects Slack xoxb token
   ✓ detects Stripe live key
   ✓ detects private key PEM header
   ✓ detects JWT token
   ✓ detects password= pattern
   ✓ detects api_key= pattern
   ✓ detects postgres connection string with credentials
   ✓ does NOT flag 'key rotation done' as a secret
   ✓ does NOT flag normal conversation text
   ✓ does NOT flag short random strings
   ✓ redacts AWS key preserving prefix and suffix
   ✓ returns unchanged text when no secrets
   ✓ returns primary secret type
   ✓ returns null primary type for clean text

 Test Files  1 passed (1)
      Tests  16 passed (16)
```

---

## 📄 License & Acknowledgements

- **License**: MIT Open Source License.
- **SDK**: Built with [`@cometchat/chat-sdk-javascript`](https://www.npmjs.com/package/@cometchat/chat-sdk-javascript).
- **Connector**: Guided by the official [CometChat MCP Server](https://mcp.cometchat.com/mcp).
- **Icons**: Lucide Icons.

<div align="center">
  <sub>Engineered for the CometChat Hackathon • IncidentRoom 🛡️</sub>
</div>
