import { NextResponse } from "next/server";
import { scanSecrets, redactSecrets } from "@/lib/secretScanner";
import { ROOMS } from "@/lib/seed";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, roomGuid, text, severity } = body;

    const appID = process.env.NEXT_PUBLIC_COMETCHAT_APP_ID;
    const region = process.env.NEXT_PUBLIC_COMETCHAT_REGION;
    const apiKey = process.env.COMETCHAT_API_KEY || process.env.NEXT_PUBLIC_COMETCHAT_AUTH_KEY;

    // 1. Secret Scanning verification endpoint
    if (action === "scan") {
      const secrets = scanSecrets(text || "");
      const isBlocked = secrets.length > 0;
      return NextResponse.json({
        ok: true,
        isBlocked,
        secretsFound: secrets.length,
        types: secrets.map((s) => s.type),
        redactedText: isBlocked ? redactSecrets(text) : text,
      });
    }

    // 2. Automated Sentinel Bot Dispatcher
    if (action === "sentinel_dispatch") {
      const targetRoom = ROOMS.find((r) => r.guid === roomGuid) || ROOMS[0];
      const alertPayload = {
        _sentinel: true,
        severity: severity || "CRITICAL",
        sourceIp: `198.51.100.${Math.floor(Math.random() * 254) + 1}`,
        affectedService: targetRoom.name,
        recommendedAction: "Enforce session isolation, revoke active tokens, notify SecOps.",
        summary: text || `Autonomous Threat Intelligence detected unusual API access patterns in ${targetRoom.name}.`,
      };

      // If CometChat server API keys are set, broadcast via CometChat REST API
      const isConfigured =
        appID &&
        apiKey &&
        !appID.includes("your_app_id") &&
        !apiKey.includes("your_auth_key");

      if (isConfigured) {
        try {
          const res = await fetch(
            `https://${appID}.api-${region}.cometchat.io/v3.0/messages`,
            {
              method: "POST",
              headers: {
                "Content-Type": "application/json",
                appId: appID,
                apiKey: apiKey,
              },
              body: JSON.stringify({
                receiver: roomGuid || targetRoom.guid,
                receiverType: "group",
                type: "text",
                data: {
                  text: JSON.stringify(alertPayload),
                  metadata: {
                    _isSentinel: true,
                    _seedSender: "sentinel-bot",
                    _senderName: "Sentinel",
                    _senderRole: "Bot",
                  },
                },
              }),
            }
          );
          const data = await res.json();
          return NextResponse.json({ ok: true, remote: true, alertPayload, data });
        } catch (err) {
          console.error("CometChat REST API error:", err);
        }
      }

      return NextResponse.json({
        ok: true,
        remote: false,
        alertPayload,
        timestamp: Date.now(),
      });
    }

    return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Internal Error";
    return NextResponse.json({ ok: false, error: message }, { status: 500 });
  }
}
