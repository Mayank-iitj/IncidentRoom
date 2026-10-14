# 80-Second Video Demo Explainer Script

> **Target Duration:** 75–80 seconds (Strictly under the 90-second hackathon limit)  
> **Key Judging Criteria Covered:**  
> 1. ✅ **The Connector is Visible:** Shows CometChat MCP tool calls in IDE / agent  
> 2. ✅ **It Runs:** Multi-window live chat, presence dots, typing indicators & Calls SDK v5 bridge  
> 3. ✅ **It's Interesting:** Real-time credential leak prevention with Secret Shield  

---

## 🛠️ Pre-Recording Checklist

1. **Dev Server Running:** Ensure `npm run dev` is active on `http://localhost:3000`.
2. **Window A (Left Half of Screen):** Regular browser window at `http://localhost:3000`.
3. **Window B (Right Half of Screen):** Incognito browser window at `http://localhost:3000`.
4. **IDE / Editor:** Have VS Code / Antigravity open in the background with `src/lib/cometchat.ts` and `README.md` visible.
5. **Screen Recorder:** Open OBS, Windows Game Bar (`Win + G`), or Loom set to record full desktop or split browser.
6. **Test Credential to Copy:** Keep this fake AWS key ready on your clipboard: `AKIAIOSFODNN7EXAMPLE`

---

## 🎬 Shot-by-Shot Teleprompter Script

### 🕒 Shot 1: The MCP Connector in the Editor [00:00 – 00:15]
* **Visual:** Fullscreen on your IDE showing `src/lib/cometchat.ts` lines 1–15 and the terminal / agent conversation showing MCP tool calls.
* **On-Screen Action:** Highlight the header comment in `cometchat.ts` citing `list_cometchat_bundles` and `react-js-sdk-quickstart`.
* **🗣️ Voiceover (Word-for-Word):**
  > "This is IncidentRoom — a real-time incident command war-room built with the CometChat MCP connector. Our AI agent connected directly to CometChat's MCP endpoint, querying implementation bundles for the React JS SDK, real-time presence, group chat, and the Calls SDK v5."

---

### 🕒 Shot 2: Live Multi-Window Chat, Presence & Typing [00:15 – 00:35]
* **Visual:** Split screen showing **Window A (Left)** and **Window B (Right)**.
* **On-Screen Actions:**
  1. In Window A, click **Asha (SOC Analyst)** → Click **"Enter War Room"**.
  2. In Window B (Incognito), click **Ravi (Incident Lead)** → Click **"Enter War Room"**.
  3. Point mouse to Ravi’s green presence dot lighting up in Asha's right sidebar.
  4. In Window B, type: `"Investigating the S3 logs now..."`.
  5. Show Window A displaying live: `"Ravi is typing..."`.
  6. Press Send in Window B → Message arrives instantly in Window A.
* **🗣️ Voiceover (Word-for-Word):**
  > "Here is the application running live across two windows. On the left is Asha, our SOC Analyst; on the right is Ravi, our Incident Commander. As soon as Ravi logs in, CometChat's UserListener updates presence in real time. When Ravi types, Asha sees live typing indicators, and message delivery is instantaneous via CometChat group messaging."

---

### 🕒 Shot 3: CometChat Calls SDK v5 Emergency Bridge [00:35 – 00:50]
* **Visual:** Focus on the War Room header in Window A.
* **On-Screen Actions:**
  1. Click the **"Voice/Video"** button in the header action bar.
  2. The **Emergency Audio/Video Bridge** drops down with the live WebRTC camera preview and remote responder speaking visualizer waves.
  3. Click **"Minimize"** to collapse it into a floating Picture-In-Picture pill in the bottom corner.
* **🗣️ Voiceover (Word-for-Word):**
  > "When an incident escalates, responders can't wait. With one click, they trigger an Emergency Audio and Video Bridge powered by CometChat Calls SDK v5. Responders get encrypted WebRTC conferencing with tile and spotlight layouts, which can be minimized to Picture-in-Picture so the war-room stream stays front and center."

---

### 🕒 Shot 4: THE SIGNATURE MOMENT — Secret Shield Interception [00:50 – 01:10]
* **Visual:** Zoom in on Asha’s message composer bar (Window A).
* **On-Screen Actions:**
  1. Paste or type into the composer: `AKIAIOSFODNN7EXAMPLE`
  2. **Pause 1 second**: Notice the live red underline under the key and the warning banner:  
     `"⚠️ Secret detected: AWS Access Key ID. This message will be blocked."`
  3. Press **Enter** to try to send it → The message is **blocked locally** and never reaches CometChat's wire.
  4. Click the **"Send Redacted"** button → Sanitized `AKIA************MPLE` is sent safely to the channel.
  5. Point to the **Shield Audit** metric in the header showing `"1 Leaks Blocked"`.
* **🗣️ Voiceover (Word-for-Word):**
  > "Now here is the signature innovation: Secret Shield. Responders under 3 AM pressure often accidentally paste production credentials into chat. As Asha types an AWS key, our inline scanner detects the credential pattern on every keystroke, underlines it in red, and physically halts dispatch to CometChat before it ever touches the wire. Responders can then click 'Send Redacted' to transmit a sanitized mask safely."

---

### 🕒 Shot 5: Wrap-Up & Open Source Repository [01:10 – 01:20]
* **Visual:** Switch to the GitHub repository: `https://github.com/Mayank-iitj/IncidentRoom`.
* **On-Screen Action:** Quickly scroll past the README badges, architecture diagram, and test results.
* **🗣️ Voiceover (Word-for-Word):**
  > "IncidentRoom: fully running with CometChat Chat SDK v4, Calls SDK v5, and built via the CometChat MCP. The code is 100% open source on GitHub. Thank you!"

---

## 🎙️ Continuous Teleprompter Readout (For Easy Reading)

> *"This is IncidentRoom — a real-time incident command war-room built with the CometChat MCP connector. Our AI agent connected directly to CometChat's MCP endpoint, querying implementation bundles for the React JS SDK, real-time presence, group chat, and the Calls SDK v5.*
> 
> *Here is the application running live across two windows. On the left is Asha, our SOC Analyst; on the right is Ravi, our Incident Commander. As soon as Ravi logs in, CometChat's UserListener updates presence in real time. When Ravi types, Asha sees live typing indicators, and message delivery is instantaneous via CometChat group messaging.*
> 
> *When an incident escalates, responders can't wait. With one click, they trigger an Emergency Audio and Video Bridge powered by CometChat Calls SDK v5. Responders get encrypted WebRTC conferencing with tile and spotlight layouts, which can be minimized to Picture-in-Picture so the war-room stream stays front and center.*
> 
> *Now here is the signature innovation: Secret Shield. Responders under 3 AM pressure often accidentally paste production credentials into chat. As Asha types an AWS key, our inline scanner detects the credential pattern on every keystroke, underlines it in red, and physically halts dispatch to CometChat before it ever touches the wire. Responders can then click 'Send Redacted' to transmit a sanitized mask safely.*
> 
> *IncidentRoom: fully running with CometChat Chat SDK v4, Calls SDK v5, and built via the CometChat MCP. The code is 100% open source on GitHub. Thank you!"*
