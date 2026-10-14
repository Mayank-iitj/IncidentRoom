<div align="center">

# 🛡️ INCIDENT ROOM
### Tactical Incident Command War-Room with Real-Time Credential Interception & Live WebRTC Bridge

[![Next.js](https://img.shields.io/badge/Next.js-16.4.0%20(Turbopack)-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.3.0-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/)
[![CometChat Chat](https://img.shields.io/badge/CometChat-Chat%20SDK%20v4-7C3AED?style=for-the-badge&logo=cometchat&logoColor=white)](https://www.cometchat.com/)
[![CometChat Calls](https://img.shields.io/badge/CometChat-Calls%20SDK%20v5-FF3366?style=for-the-badge&logo=webrtc&logoColor=white)](https://www.cometchat.com/docs/calls)
[![MCP](https://img.shields.io/badge/CometChat%20MCP-Connector%20Verified-00D26A?style=for-the-badge&logo=anthropic&logoColor=white)](https://mcp.cometchat.com/mcp)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vitest](https://img.shields.io/badge/Tests-16%2F16%20Passing-brightgreen?style=for-the-badge&logo=vitest&logoColor=white)](https://vitest.dev/)
[![Security Shield](https://img.shields.io/badge/Secret%20Shield-Active%20Interception-CCFF00?style=for-the-badge&logo=shield&logoColor=black)](#-secret-shield-credential-interception)

<p align="center">
  <b>Incident chat that stops credential leaks. Live.</b><br>
  Built for high-pressure security war-rooms where responders collaborate in real time — and the chat itself detects, highlights, and blocks credential leaks before they ever hit the wire, complete with a live <b>CometChat Calls SDK v5 Emergency Voice & Video Bridge</b>.
</p>

[Explore The Code](https://github.com/Mayank-iitj/IncidentRoom) • [Quick Start](#-quick-start) • [Architecture](#-system-architecture) • [Voice & Video Bridge](#-emergency-audio--video-bridge-cometchat-calls-sdk-v5) • [MCP Deep Dive](#-built-with-the-cometchat-mcp) • [Secret Shield](#-secret-shield-credential-interception) • [Demo Script](DEMO_SCRIPT.md)

---

</div>

## 📑 Table of Contents
- [Executive Overview](#-executive-overview)
- [How CometChat Judges Evaluate IncidentRoom](#-how-cometchat-judges-evaluate-incidentroom)
- [System Architecture](#-system-architecture)
- [Emergency Audio & Video Bridge (CometChat Calls SDK v5)](#-emergency-audio--video-bridge-cometchat-calls-sdk-v5)
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
**IncidentRoom** merges tactical real-time collaboration with an automated **client-side heuristic security shield** and an instant **WebRTC voice & video bridge**:
1. **Real-Time Group War-Rooms**: Powered by the CometChat v4 JavaScript SDK with low-latency messaging, active member presence, and live typing indicators.
2. **Inline Secret Shield Barrier**: Scans keystrokes in real time within the message composer. The moment a credential pattern or high-entropy secret is detected, the UI renders an immediate warning and **physically aborts dispatch to CometChat's network layer**.
3. **One-Click Redacted Fallback**: Generates cryptographic masks (`AKIA************MPLE`) instantly, allowing responders to communicate context without compromising secrets.
4. **Emergency Audio & Video Bridge**: Built on **CometChat Calls SDK v5**, enabling responders to launch an instant, encrypted WebRTC voice/video huddle right inside the war room while keeping the chat active.
5. **Autonomous Threat Feeds**: Integrated **Sentinel** bot generates structured threat intelligence alerts and deterministic incident summaries without hallucination risks.

---

## 🏆 How CometChat Judges Evaluate IncidentRoom

| CometChat Judging Criterion | How IncidentRoom Delivers | Proof in Repository |
| :--- | :--- | :--- |
| **1. It Runs**<br>_Working software, not a plan_ | • Complete Next.js 16 + React 19 production build<br>• Fully functional multi-window live chat, presence, typing, and video bridge<br>• 16/16 automated unit tests passing in CI/Vitest | • [secretScanner.test.ts](secretScanner.test.ts)<br>• [EmergencyCallBridge.tsx](src/components/EmergencyCallBridge.tsx)<br>• [DEMO_SCRIPT.md](DEMO_SCRIPT.md)<br>• Run `npm run build && npm test` |
| **2. It's Interesting**<br>_Novel concept beyond basic chat_ | • Rather than standard messaging, this is an **enterprise cybersecurity war-room** combining chat, Calls SDK WebRTC huddle, and active secret containment<br>• Solves a real-world enterprise nightmare: accidental credential leakage during live incidents | • [ComposerBar.tsx](src/components/ComposerBar.tsx)<br>• [secretScanner.ts](src/lib/secretScanner.ts)<br>• [EmergencyCallBridge.tsx](src/components/EmergencyCallBridge.tsx)<br>• Real-time red underline & block banner |
| **3. It Uses the MCP**<br>_Connector did real work in build_ | • The build agent connected to `https://mcp.cometchat.com/mcp`<br>• Retrieved bundles for Chat SDK, Presence, and Calls SDK v5 architectures<br>• Code verified against official CometChat MCP schemas | • [MCP Tool Call Matrix](#-built-with-the-cometchat-mcp)<br>• Header citation in [cometchat.ts](src/lib/cometchat.ts)<br>• Calls bridge in [cometchatCalls.ts](src/lib/cometchatCalls.ts) |

---

## 🏛️ System Architecture

```mermaid
flowchart TB
    subgraph ClientUI["Next.js 16 App Router (Client Shell)"]
        direction TB
        Landing["Landing & Persona Deck\n(Asha / Ravi / Sentinel)"]
        WarRoom["WarRoom Command Center\n(3-Column Layout)"]
        Composer["ComposerBar Component\n(Live Keystroke Listener)"]
        CallBridge["EmergencyCallBridge.tsx\n(WebRTC Audio/Video Tiles)"]
        Members["Members & Presence Panel\n(Real-time User Dots)"]
    end

    subgraph SecurityShield["Secret Shield Heuristic Engine"]
        Scanner["secretScanner.ts\n(Pure Functions & Entropy)"]
        Filter{"Credential\nDetected?"}
        BlockCard["Local Blocked Card\n(Sanitized Mask Generator)"]
    end

    subgraph CometChatPlatform["CometChat Cloud & MCP Infrastructure"]
        ChatSDK["@cometchat/chat-sdk-javascript (v4)"]
        CallsSDK["@cometchat/calls-sdk-javascript (v5)"]
        GroupMsg["Group Messaging Service\n(INC-101 / INC-102 / INC-103)"]
        PresenceEngine["Presence & Typing Engine\n(UserListener & TypingIndicator)"]
        WebRTCBridge["CometChat Calls WebRTC Mesh\n(Tile & Spotlight Layouts)"]
        MCPServer["CometChat MCP Server\n(https://mcp.cometchat.com/mcp)"]
    end

    Landing -->|"CometChat.login()"| ChatSDK
    WarRoom --> Composer
    WarRoom --> CallBridge
    Composer -->|"onChange (keystrokes)"| Scanner
    Scanner --> Filter
    
    Filter -->|"YES (Secret Detected)"| BlockCard
    BlockCard -.->|"Abort Network Send\n(Never Hits CometChat)"| WarRoom
    
    Filter -->|"NO (Clean / Redacted)"| ChatSDK
    ChatSDK --> GroupMsg
    ChatSDK --> PresenceEngine
    GroupMsg --> WarRoom
    PresenceEngine --> Members

    CallBridge -->|"joinSession() / toggleAudio() / toggleVideo()"| CallsSDK
    CallsSDK --> WebRTCBridge
    MCPServer -.->|"Injected Implementation Bundles"| ChatSDK
    MCPServer -.->|"Calls SDK Reference Schemas"| CallsSDK
```

---

## 📞 Emergency Audio & Video Bridge (CometChat Calls SDK v5)

IncidentRoom integrates **CometChat Calls SDK v5** (`@cometchat/calls-sdk-javascript`) to provide an instant, encrypted WebRTC audio/video bridge directly within the command center.

### 🌟 Key Capabilities
- **One-Click War-Room Huddle**: Responders can toggle the emergency bridge with a single click in the header without leaving their chat context.
- **Dual Layout Engines**: Switch between **Tile View** (multi-responder matrix) and **Spotlight View** (focus on primary responder / screen share).
- **Tactical Media Controls**:
  - 🎤 **Mute / Unmute Audio** with live waveform animation.
  - 📹 **Pause / Resume Video** with responder initials fallback.
  - 🖥️ **Screen Sharing**: Share terminal traces, AWS console tabs, or packet logs.
  - ✋ **Raise Hand**: Non-disruptive audio turn-taking during high-stress incident triages.
  - 🗗 **Picture-In-Picture (PIP) Minimization**: Shrink the bridge to a floating pill in the corner so responders can review logs and chat uninterrupted.
- **E2E Encrypted WebRTC**: Low-latency peer communication powered by CometChat Calls infrastructure.

```typescript
// Initializing and joining CometChat Calls v5 Session
import { CometChatCalls } from "@cometchat/calls-sdk-javascript";

await CometChatCalls.init({ appId, region, authKey });
const { token } = await CometChatCalls.generateToken(incidentSessionId, authKey);
await CometChatCalls.joinSession(token, { mode: "TILE" }, containerElement);
```

---

## 🔌 Built with the CometChat MCP

IncidentRoom was engineered using the official **CometChat Model Context Protocol (MCP)** server:
```
MCP Host Endpoint: https://mcp.cometchat.com/mcp
Transport: SSE (Server-Sent Events)
Integration Scope: Chat SDK v4 bootstrap, Calls SDK v5 WebRTC sessions, presence listeners, and typing indicators
```

### 🛠️ MCP Tool Calls Executed

| MCP Tool Invocation | Parameters / Query | Agent Impact & Generated Artifacts |
| :--- | :--- | :--- |
| `list_cometchat_bundles` | `{}` | Discovered pre-packaged reference architectures (`react-js-sdk-quickstart`, `presence-typing-indicators`, `group-chat`). |
| `get_cometchat_implementation_bundle` | `bundle_name: "react-js-sdk-quickstart"` | Provided standard `AppSettingsBuilder`, `CometChat.init()`, session login routines, and TypeScript interfaces. |
| `get_cometchat_implementation_bundle` | `bundle_name: "presence-typing-indicators"` | Delivered `subscribePresenceForAllUsers()`, `UserListener`, and typing indicator lifecycle callbacks. |
| `search_cometchat_docs` | `query: "calls javascript sdk v5 session management"` | Sourced Calls SDK v5 singleton lifecycle, `generateToken`, and `joinSession` signatures. |
| `fetch_cometchat_doc_page` | `path: "/sdk/javascript/overview.md"` | Verified breaking API differences across CometChat JS SDK major versions. |

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
- 📞 **Emergency Voice & Video Bridge**: Full WebRTC video/audio conferencing powered by **CometChat Calls SDK v5**.
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
| **Asha** (`asha-soc`) | **SOC Analyst** | Frontline triage, threat analysis, incident feed participation, audio/video bridge, alert acknowledgment. | 🟢 Emerald / Lime Accent |
| **Ravi** (`ravi-lead`) | **Incident Lead** | Command authority, severity escalation to **CRITICAL**, room containment, audio/video bridge lead. | 🔵 Cyan / Indigo Accent |
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
  - `Calls WebRTC Magenta/Cyan`: `#ff3366` & `#06b6d4`
- **Typography**: 
  - Headings & Interface: `Space Grotesk`
  - Logs, Payloads & Timers: `JetBrains Mono`
- **Micro-Interactions**: Ambient radial glows, glassmorphism card borders (`rgba(255,255,255,0.08)`), pulsing voice waves, and spring-based Framer Motion entrance transitions.

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

> **💡 Multi-User Testing Tip:** Open **Window A** in normal browsing mode and **Window B** in an Incognito window. Log in as **Asha** in Window A and **Ravi** in Window B to see real-time presence, typing indicators, the Emergency Voice/Video Bridge, and Secret Shield in action simultaneously.

---

## 🧪 Automated Test Suite

IncidentRoom includes a dedicated **Vitest** test suite ensuring 100% regex integrity and false-positive prevention:

```bash
npm test
```

### Test Results
```text
 ✓ secretScanner.test.ts (16 tests) 26ms
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
- **Chat SDK**: Built with [`@cometchat/chat-sdk-javascript`](https://www.npmjs.com/package/@cometchat/chat-sdk-javascript) (v4).
- **Calls SDK**: Built with [`@cometchat/calls-sdk-javascript`](https://www.npmjs.com/package/@cometchat/calls-sdk-javascript) (v5).
- **Connector**: Guided by the official [CometChat MCP Server](https://mcp.cometchat.com/mcp).
- **Icons**: Lucide Icons.

<div align="center">
  <sub>Engineered for the CometChat Hackathon • IncidentRoom 🛡️</sub>
</div>
