import { describe, it, expect } from "vitest";
import {
  scanSecrets,
  hasSecrets,
  redactSecrets,
  primarySecretType,
} from "@/lib/secretScanner";

describe("secretScanner", () => {
  // ─── True Positives ────────────────────────────────────────────────────────

  it("detects AWS Access Key ID", () => {
    const text = "Found a key: AKIAIOSFODNN7EXAMPLE in the logs";
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "AWS Access Key ID")).toBe(true);
  });

  it("detects GitHub ghp_ token", () => {
    const text = "Token: ghp_aBcDeFgHiJkLmNoPqRsTuVwXyZ1234567890 leaked";
    expect(hasSecrets(text)).toBe(true);
    const matches = scanSecrets(text);
    expect(matches[0].type).toBe("GitHub Token");
  });

  it("detects Slack xoxb token", () => {
    // Constructed dynamically so GitHub push protection does not flag dummy test data
    const text = "Slack bot token " + ["xoxb", "000000000000", "000000000000", "abcdefghijklmnopqrstuvwx"].join("-");
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "Slack Token")).toBe(true);
  });

  it("detects Stripe live key", () => {
    // Constructed dynamically so GitHub push protection does not flag dummy test data
    const text = "Stripe key: " + ["sk", "live", "51HaEXAMPLEMOCKTESTKEY9999999999"].join("_");
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "Stripe Live Key")).toBe(true);
  });

  it("detects private key PEM header", () => {
    const text = "-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAK";
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "Private Key")).toBe(true);
  });

  it("detects JWT token", () => {
    const text =
      "Auth header: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "JWT Token")).toBe(true);
  });

  it("detects password= pattern", () => {
    const text = "Connection: host=db.example.com password=supersecret123 port=5432";
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "Password in Plaintext")).toBe(true);
  });

  it("detects api_key= pattern", () => {
    const text = "curl https://api.example.com?api_key=abc123xyz456";
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "API Key in Plaintext")).toBe(true);
  });

  it("detects postgres connection string with credentials", () => {
    const text = "DB_URL=postgres://admin:s3cr3tp4ss@prod-db.example.com:5432/mydb";
    const matches = scanSecrets(text);
    expect(matches.some((m) => m.type === "Database Connection String")).toBe(true);
  });

  // ─── False Positive Checks ──────────────────────────────────────────────────

  it("does NOT flag 'key rotation done' as a secret", () => {
    expect(hasSecrets("key rotation done for the week")).toBe(false);
  });

  it("does NOT flag normal conversation text", () => {
    const text =
      "I've confirmed the phishing attempt. The attacker used a spoofed email domain.";
    expect(hasSecrets(text)).toBe(false);
  });

  it("does NOT flag short random strings", () => {
    expect(hasSecrets("abc123 is the ticket number")).toBe(false);
  });

  // ─── Redaction ─────────────────────────────────────────────────────────────

  it("redacts AWS key preserving prefix and suffix", () => {
    const text = "Key: AKIAIOSFODNN7EXAMPLE here";
    const redacted = redactSecrets(text);
    expect(redacted).toContain("AKIA");
    expect(redacted).not.toContain("IOSFODNN7EXAMPLE");
    expect(redacted).toContain("****");
  });

  it("returns unchanged text when no secrets", () => {
    const text = "Everything looks clean here.";
    expect(redactSecrets(text)).toBe(text);
  });

  it("returns primary secret type", () => {
    const text = "Key: AKIAIOSFODNN7EXAMPLE";
    expect(primarySecretType(text)).toBe("AWS Access Key ID");
  });

  it("returns null primary type for clean text", () => {
    expect(primarySecretType("clean text")).toBeNull();
  });
});
