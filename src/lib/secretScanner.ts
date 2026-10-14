/**
 * Secret Scanner — pure functions, fully unit-testable.
 * Detects credential leaks before they are sent via CometChat.
 *
 * Patterns checked (MCP moderation bundle consulted for pattern list):
 * - AWS Access Key IDs (AKIA...)
 * - AWS Secret Access Keys (40-char base64-ish)
 * - GitHub tokens (ghp_, gho_, github_pat_)
 * - Slack tokens (xox[baprs]-)
 * - Stripe live secret keys (sk_live_)
 * - Private key PEM headers
 * - JWTs (eyJ...)
 * - password= / api_key= patterns
 * - Connection strings with credentials
 */

export interface SecretMatch {
  type: string;
  value: string;
  redacted: string;
  start: number;
  end: number;
}

interface SecretPattern {
  type: string;
  regex: RegExp;
  redact: (match: string) => string;
}

const PATTERNS: SecretPattern[] = [
  {
    type: "AWS Access Key ID",
    regex: /\bAKIA[0-9A-Z]{16}\b/g,
    redact: (m) => m.slice(0, 4) + "************" + m.slice(-4),
  },
  {
    type: "AWS Secret Access Key",
    regex: /\b(?<![A-Za-z0-9/+=])[A-Za-z0-9/+=]{40}(?![A-Za-z0-9/+=])/g,
    redact: (m) => m.slice(0, 4) + "****************************" + m.slice(-4),
  },
  {
    type: "GitHub Token",
    regex: /\b(ghp_[A-Za-z0-9_]{36,}|gho_[A-Za-z0-9_]{36,}|github_pat_[A-Za-z0-9_]{22,}__[A-Za-z0-9_]{59,})\b/g,
    redact: (m) => {
      const prefix = m.split("_")[0] + "_";
      return prefix + "****" + m.slice(-4);
    },
  },
  {
    type: "Slack Token",
    regex: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/g,
    redact: (m) => m.slice(0, 8) + "****" + m.slice(-4),
  },
  {
    type: "Stripe Live Key",
    regex: /\bsk_live_[A-Za-z0-9]{24,}\b/g,
    redact: (m) => "sk_live_" + "****" + m.slice(-4),
  },
  {
    type: "Private Key",
    regex: /-----BEGIN (?:RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g,
    redact: () => "-----BEGIN PRIVATE KEY [REDACTED]-----",
  },
  {
    type: "JWT Token",
    regex: /\beyJ[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\.[A-Za-z0-9_-]{10,}\b/g,
    redact: (m) => "eyJ****." + m.split(".")[1]?.slice(0, 4) + "****.[sig]",
  },
  {
    type: "Password in Plaintext",
    regex: /\b(?:password|passwd|pwd)\s*=\s*[^\s&;,'"]{4,}/gi,
    redact: (m) => {
      const eq = m.indexOf("=");
      return m.slice(0, eq + 1) + "****";
    },
  },
  {
    type: "API Key in Plaintext",
    regex: /\bapi[_-]?key\s*=\s*[^\s&;,'"]{4,}/gi,
    redact: (m) => {
      const eq = m.indexOf("=");
      return m.slice(0, eq + 1) + "****";
    },
  },
  {
    type: "Database Connection String",
    regex:
      /(?:postgres|mysql|mongodb|redis):\/\/[^:@\s]+:[^@\s]+@[^\s]*/gi,
    redact: (m) => {
      return m.replace(/:([^@]*)@/, ":****@");
    },
  },
];

/** Scan text and return all detected secrets with their positions. */
export function scanSecrets(text: string): SecretMatch[] {
  const matches: SecretMatch[] = [];
  const seen = new Set<string>();

  for (const pattern of PATTERNS) {
    const regex = new RegExp(pattern.regex.source, pattern.regex.flags);
    let m: RegExpExecArray | null;
    while ((m = regex.exec(text)) !== null) {
      const key = `${m.index}-${m[0]}`;
      if (seen.has(key)) continue;
      seen.add(key);

      // Skip the AWS Secret Access Key pattern if it's likely a normal word
      // (false-positive filter: must contain at least one digit and one special char or be exactly 40 chars)
      if (pattern.type === "AWS Secret Access Key") {
        const val = m[0];
        if (
          val.length !== 40 ||
          !/[0-9]/.test(val) ||
          !/[/+=]/.test(val)
        ) {
          continue;
        }
      }

      matches.push({
        type: pattern.type,
        value: m[0],
        redacted: pattern.redact(m[0]),
        start: m.index,
        end: m.index + m[0].length,
      });
    }
  }

  return matches.sort((a, b) => a.start - b.start);
}

/** Returns true if the text contains any secrets. */
export function hasSecrets(text: string): boolean {
  return scanSecrets(text).length > 0;
}

/** Replace all detected secrets with redacted versions. */
export function redactSecrets(text: string): string {
  const matches = scanSecrets(text);
  if (matches.length === 0) return text;

  let result = "";
  let cursor = 0;

  for (const match of matches) {
    result += text.slice(cursor, match.start);
    result += match.redacted;
    cursor = match.end;
  }

  result += text.slice(cursor);
  return result;
}

/** Primary type of the first detected secret (for display). */
export function primarySecretType(text: string): string | null {
  const matches = scanSecrets(text);
  return matches[0]?.type ?? null;
}
