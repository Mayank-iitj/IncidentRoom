# DEMO_SCRIPT.md — IncidentRoom 85-Second Video Script

## Setup Before Recording

1. Fill in `.env.local` with real CometChat credentials
2. Run `npm run dev` — app on `localhost:3000`
3. Open two browser windows: **Window A** (normal) and **Window B** (incognito)
4. Open CometChat Dashboard to show MCP integration (optional for intro)

---

## Shot-by-Shot Script

### 0–12s: Agent + MCP Tool Calls Visible

**Shot:** Screen-record your terminal / IDE with Antigravity/Claude Code running the build prompt.

**Narration:**
> "I'm building IncidentRoom using the CometChat MCP — an AI agent called the list-bundles tool, then pulled the react-js-sdk-quickstart and presence-typing-indicators bundles. Here's the MCP tool call log..."

**What to show:**
- Terminal with MCP tool calls: `list_cometchat_bundles`, `get_cometchat_implementation_bundle`
- The agent writing `lib/cometchat.ts` with verified SDK imports
- Bundle names appearing in console

**Exact MCP calls to highlight:**
```
list_cometchat_bundles → [react-js-sdk-quickstart, presence-typing-indicators, group-chat, ...]
get_cometchat_implementation_bundle("react-js-sdk-quickstart")
search_cometchat_docs("group messaging typing indicators")
fetch_cometchat_doc_page("/sdk/javascript/overview.md")
```

---

### 12–40s: Live Chat and Presence

**Window A:** Log in as **Asha** (SOC Analyst)
**Window B:** Log in as **Ravi** (Incident Lead)

**Steps:**
1. Show login screen — three persona cards with glow effects
2. Asha clicks her card — signs in. Room list appears.
3. Navigate to **INC-102 Leaked API Key** (CRITICAL severity)
4. Show the Sentinel seed messages already in the room
5. Ravi logs in (Window B) — presence dot lights up in Asha's members panel
6. Ravi types in Window B — "Investigating the S3 logs now..."
7. In Window A: Asha sees "Ravi is typing..." with animated dots
8. Ravi sends the message — it appears instantly in Asha's window

**Narration:**
> "Real-time CometChat group chat — presence dots, typing indicators, and message delivery all live across two windows."

---

### 40–55s: Sentinel Alert & Emergency Voice/Video Bridge (Calls SDK v5)

**Steps (in Asha's window):**
1. Click "Simulate Alert" in the header — structured threat intelligence card appears.
2. Click **"Voice/Video"** in the header — the **Emergency Audio/Video Bridge** drops down:
   - Live WebRTC camera tiles with Asha and Ravi
   - Real-time voice waveform animations and active speaking indicator
   - Tactical controls: Mic toggle, Camera toggle, Screen share, and Raise hand
   - Click "Minimize" to show Picture-In-Picture mode in the corner while keeping the chat active!

**Narration:**
> "When an incident spikes, responders jump straight onto an encrypted WebRTC voice and video bridge powered by CometChat Calls SDK v5, without losing chat context."

**Alternative — Run Demo Mode:**
1. Click "Run Demo" button
2. Watch the automated 60-second sequence play out:
   - Asha asks for status → Sentinel posts alert → Ravi replies → Asha tries to paste credentials → Shield blocks → Asha sends redacted version → Sentinel summarizes

---

### 60–80s: Secret Blocked (THE MOMENT)

**Steps:**
1. In Asha's composer, type: `AKIAIOSFODNN7EXAMPLE` (fake AWS key)
2. **WHILE TYPING:** the key gets a red underline and the banner appears:
   > "⚠️ Secret detected: AWS Access Key ID. This message will be blocked."
3. Press Enter to try to send → Message is BLOCKED, never sent to CometChat
4. A red blocked card appears in the thread (only visible to Asha)
5. Click "Send redacted" — redacted version `AKIA************MPLE` is sent to the room
6. Show the Shield stats counter increment in the header: "1 blocked"
7. Click "Shield Log" in the sidebar to show the blocked entry with timestamp

**Narration:**
> "This is the signature feature — Secret Shield catches credentials live as you type, blocks the message at the composer layer before it ever hits CometChat, and offers a one-click redacted send."

---

### 80–85s: Repo + Pitch

**Shot:** GitHub repo + CometChat MCP docs side by side

**Narration:**
> "IncidentRoom: built with the CometChat MCP in under 6 hours. Incident chat that stops credential leaks, live. Open source at [repo URL]."

Show:
- README.md MCP tools table
- `lib/cometchat.ts` comment citing MCP bundles
- CometChat Dashboard showing the created groups and users

---

## Manual Two-Window Test Flow

For testing without demo mode:

| Step | Window A (Asha) | Window B (Ravi) |
|------|-----------------|-----------------|
| 1 | Open `localhost:3000` | Open incognito `localhost:3000` |
| 2 | Click Asha's persona card | Click Ravi's persona card |
| 3 | Navigate to INC-102 | Navigate to INC-102 |
| 4 | See Ravi's presence dot light up | See Asha's presence dot |
| 5 | Type a message (observe typing indicator in Window B) | |
| 6 | | Observe "Asha is typing..." |
| 7 | Send message | See it arrive instantly |
| 8 | Type: `AKIAIOSFODNN7EXAMPLE` | |
| 9 | See red underline + warning banner | |
| 10 | Press Enter | Nothing appears (blocked) |
| 11 | Click "Send redacted" | See redacted version appear |
| 12 | | Click "Simulate Alert" |
| 13 | See Sentinel alert card appear | |
| 14 | Click "Acknowledge" | See acknowledgment in Window B |
| 15 | Ravi clicks "Escalate" | Room flips to CRITICAL |
| 16 | Both windows show CRITICAL badge | |

---

## CometChat Dashboard Moderation Rules (Server-Side Defense in Depth)

For the moderation bundle as second layer:

1. Log into [CometChat Dashboard](https://app.cometchat.com)
2. Select your app → **Moderation** tab
3. Under **Text Moderation** → **Custom Rules** → **Add Rule**
4. Add rules for each pattern:

| Rule Name | Pattern (Regex) | Action |
|-----------|----------------|--------|
| AWS Access Key | `AKIA[0-9A-Z]{16}` | Block |
| GitHub Token | `ghp_[A-Za-z0-9_]{36,}` | Block |
| Slack Token | `xox[baprs]-[A-Za-z0-9-]{10,}` | Block |
| Stripe Live Key | `sk_live_[A-Za-z0-9]{24,}` | Block |
| Private Key PEM | `-----BEGIN.*PRIVATE KEY-----` | Block |

5. Set severity to **High** and enable for **Group Messages**
6. Save rules — now both client-side AND server-side will block secrets

---

## Social Posts

### X (Twitter) — 280 characters

```
Built IncidentRoom for #ZeroToChat 🛡️ — a security incident war-room where the chat itself blocks credential leaks LIVE.

Type an AWS key → red underline + blocked before it hits @CometChat.

Built with the CometChat MCP in <6h.

github.com/[username]/incidentroom
```

### LinkedIn Post

```
🛡️ Excited to share my #ZeroToChat hackathon entry: IncidentRoom!

The problem: During incident response, security teams under pressure accidentally paste real AWS keys, GitHub tokens, and passwords into group chat — compromising them instantly.

The solution: I built a real-time security war-room where:
✅ Responders chat via @CometChat real-time messaging
✅ Typing indicators and presence show who's online
✅ Sentinel bot posts structured threat intelligence cards
✅ Secret Shield scans every keystroke — if you type AKIAIOSFODNN7EXAMPLE, it gets a red underline and the message is BLOCKED before it ever reaches CometChat
✅ One-click "Send redacted" safely shares the sanitized version

What made this possible: The CometChat MCP (Model Context Protocol) server. My AI agent called list-bundles, pulled the react-js-sdk-quickstart and presence/typing bundles, and had verified API documentation in-context. No guessing, no trial-and-error.

Built in under 6 hours with Next.js, TypeScript, and @CometChat's JS SDK.

#ZeroToChat #CometChat #SecurityEngineering #IncidentResponse #Hackathon #AI
```
