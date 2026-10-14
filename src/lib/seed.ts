/**
 * Seed data for IncidentRoom.
 * Creates users, groups, auto-joins members, and seeds initial messages.
 * Idempotent: safe to call on every app start.
 */
import {
  CometChat,
  createOrUpdateUser,
  createGroup,
  joinGroup,
  sendGroupMessage,
  fetchGroupMessages,
} from "./cometchat";

export const PERSONAS = [
  {
    uid: "asha-soc",
    name: "Asha",
    role: "SOC Analyst",
    color: "#10B981",
    initials: "A",
  },
  {
    uid: "ravi-lead",
    name: "Ravi",
    role: "Incident Lead",
    color: "#F59E0B",
    initials: "R",
  },
  {
    uid: "sentinel-bot",
    name: "Sentinel",
    role: "Bot",
    color: "#22D3EE",
    initials: "S",
    isBot: true,
  },
] as const;

export type PersonaUid = (typeof PERSONAS)[number]["uid"];

export const ROOMS = [
  {
    guid: "inc-101-phishing",
    name: "INC-101 Phishing Campaign",
    severity: "HIGH" as const,
    icon: "🎣",
  },
  {
    guid: "inc-102-leaked-key",
    name: "INC-102 Leaked API Key",
    severity: "CRITICAL" as const,
    icon: "🔑",
  },
  {
    guid: "inc-103-login-spike",
    name: "INC-103 Suspicious Login Spike",
    severity: "MEDIUM" as const,
    icon: "📈",
  },
] as const;

export type RoomGuid = (typeof ROOMS)[number]["guid"];

export const SEED_MESSAGES: Record<string, Array<{ uid: string; text: string }>> = {
  "inc-101-phishing": [
    {
      uid: "sentinel-bot",
      text: JSON.stringify({
        _sentinel: true,
        severity: "HIGH",
        sourceIp: "185.220.101.47",
        affectedService: "Corporate Email (Google Workspace)",
        recommendedAction: "Block sender domain, force MFA reset for targets",
        summary:
          "Spear-phishing campaign detected. 23 employees received malicious links disguised as IT security notifications.",
      }),
    },
    {
      uid: "asha-soc",
      text: "Confirmed — I'm seeing bounce-backs from our phishing filter. The links resolve to a credential harvesting page on *.ru domain.",
    },
    {
      uid: "ravi-lead",
      text: "Escalating to INC-101. Asha, pull the list of users who clicked the link from the proxy logs.",
    },
    {
      uid: "asha-soc",
      text: "On it. Initial count: 4 users clicked. Isolating their sessions now.",
    },
    {
      uid: "sentinel-bot",
      text: JSON.stringify({
        _sentinel: true,
        severity: "HIGH",
        sourceIp: "185.220.101.47",
        affectedService: "SSO / Okta",
        recommendedAction:
          "Suspend compromised sessions, notify security team",
        summary:
          "Follow-up: SSO login attempts detected from suspicious IPs for 2 of the 4 affected users.",
      }),
    },
  ],
  "inc-102-leaked-key": [
    {
      uid: "ravi-lead",
      text: "GitGuardian alert fired — a live AWS key was committed to the public repo 8 minutes ago.",
    },
    {
      uid: "sentinel-bot",
      text: JSON.stringify({
        _sentinel: true,
        severity: "CRITICAL",
        sourceIp: "N/A (internal commit)",
        affectedService: "AWS Production Account (us-east-1)",
        recommendedAction:
          "Revoke key immediately via IAM, rotate all secrets in that repo",
        summary:
          "AWS Access Key ID detected in public GitHub commit. Key has been active for 8 minutes. No known exploitation yet.",
      }),
    },
    {
      uid: "asha-soc",
      text: "I've already revoked the key in IAM. Checking CloudTrail for usage in the last 10 minutes.",
    },
    {
      uid: "ravi-lead",
      text: "Good. Also force-push to remove from git history and rotate all secrets in that .env file.",
    },
    {
      uid: "asha-soc",
      text: "CloudTrail shows 3 DescribeInstances calls and one S3 List from unfamiliar IP: 93.184.216.34. Logging full trail now.",
    },
  ],
  "inc-103-login-spike": [
    {
      uid: "asha-soc",
      text: "Anomaly detected: 847 failed login attempts in 5 minutes against customer portal. Classic credential stuffing.",
    },
    {
      uid: "sentinel-bot",
      text: JSON.stringify({
        _sentinel: true,
        severity: "MEDIUM",
        sourceIp: "Multiple (TOR exit nodes + residential proxies)",
        affectedService: "Customer Portal (app.company.com)",
        recommendedAction:
          "Enable CAPTCHA, rate-limit by IP, alert account security team",
        summary:
          "Credential stuffing attack in progress. Attackers cycling through 15k leaked email/password combos. 12 accounts successfully compromised so far.",
      }),
    },
    {
      uid: "ravi-lead",
      text: "Rate limiting is on. Let's monitor for account takeover patterns in the next 30 mins.",
    },
  ],
};

export async function seedData(): Promise<void> {
  // 1. Create/update all users
  for (const persona of PERSONAS) {
    const avatarUrl = `https://api.dicebear.com/7.x/initials/svg?seed=${persona.name}&backgroundColor=${encodeURIComponent(persona.color.replace("#", ""))}&fontFamily=Inter`;
    await createOrUpdateUser(persona.uid, persona.name, avatarUrl);
  }

  // 2. Create groups and join all members
  for (const room of ROOMS) {
    await createGroup(room.guid, room.name);
    for (const persona of PERSONAS) {
      await joinGroup(room.guid);
    }
  }
}

export async function seedMessagesForRoom(guid: string): Promise<void> {
  const seeds = SEED_MESSAGES[guid];
  if (!seeds) return;

  // Check if messages already exist (idempotent check)
  const existing = await fetchGroupMessages(guid, 10);
  if (existing.length > 0) return; // Already seeded

  // We need to send as each user — but we can only send as the logged-in user.
  // For seeding, we'll mark these with metadata and send as the bot persona.
  // In a real app, you'd use the REST API to send on behalf of users.
  // For the hackathon demo: we send seed messages as the current user
  // but with metadata indicating the original sender for display.
  for (const seed of seeds) {
    const isSentinel = seed.uid === "sentinel-bot";
    const persona = PERSONAS.find((p) => p.uid === seed.uid);
    if (!persona) continue;

    try {
      await sendGroupMessage(guid, seed.text, {
        _seedSender: seed.uid,
        _senderName: persona.name,
        _senderRole: persona.role,
        _isSentinel: isSentinel,
        _seeded: true,
      });
      // Small delay between seeded messages
      await new Promise((r) => setTimeout(r, 300));
    } catch {
      // Ignore seed errors
    }
  }
}
