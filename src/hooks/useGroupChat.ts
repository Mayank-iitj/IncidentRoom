"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { CometChat, fetchGroupMessages, sendGroupMessage } from "@/lib/cometchat";
import { PERSONAS, SEED_MESSAGES } from "@/lib/seed";

export interface ChatMessage {
  id: string;
  uid: string;
  name: string;
  text: string;
  sentAt: number;
  isSentinel: boolean;
  isBlocked?: boolean;
  metadata?: Record<string, unknown>;
  readAt?: number;
  deliveredAt?: number;
}

function transformMessage(msg: CometChat.BaseMessage): ChatMessage | null {
  if (!(msg instanceof CometChat.TextMessage)) return null;

  const metadata = (msg.getMetadata() as Record<string, unknown>) ?? {};
  const seedSender = metadata._seedSender as string | undefined;
  const senderName = metadata._senderName as string | undefined;
  const isSentinel = !!(metadata._isSentinel as boolean | undefined);

  const senderUid = seedSender ?? msg.getSender().getUid();
  const name =
    senderName ?? msg.getSender().getName() ?? senderUid;

  return {
    id: String(msg.getId()),
    uid: senderUid,
    name,
    text: msg.getText(),
    sentAt: msg.getSentAt(),
    isSentinel,
    metadata,
  };
}

export function useGroupChat(guid: string | null) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [typingUsers, setTypingUsers] = useState<string[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const listenerIdRef = useRef<string>("");
  const typingListenerIdRef = useRef<string>("");

  // Load message history
  const loadMessages = useCallback(async () => {
    if (!guid) return;
    setLoading(true);
    try {
      const raw = await fetchGroupMessages(guid);
      const msgs = raw
        .map(transformMessage)
        .filter(Boolean) as ChatMessage[];

      if (msgs.length > 0) {
        setMessages(msgs);
      } else {
        // Fallback to local seeds
        const seeds = SEED_MESSAGES[guid] || [];
        const localMsgs: ChatMessage[] = seeds.map((s, idx) => {
          const isSentinel = s.uid === "sentinel-bot";
          const p = (PERSONAS as readonly { uid: string; name: string }[]).find((persona) => persona.uid === s.uid);
          return {
            id: `seed-${idx}`,
            uid: s.uid,
            name: p?.name ?? s.uid,
            text: s.text,
            sentAt: Math.floor(Date.now() / 1000) - (seeds.length - idx) * 60,
            isSentinel,
          };
        });
        setMessages(localMsgs);
      }
    } catch (err) {
      console.error("Failed to load messages:", err);
    } finally {
      setLoading(false);
    }
  }, [guid]);

  useEffect(() => {
    if (!guid) return;
    loadMessages();

    // Set up real-time message listener
    const listenerId = `chat-${guid}-${Date.now()}`;
    listenerIdRef.current = listenerId;

    CometChat.addMessageListener(
      listenerId,
      new CometChat.MessageListener({
        onTextMessageReceived: (msg: CometChat.TextMessage) => {
          if (msg.getReceiverType() === CometChat.RECEIVER_TYPE.GROUP &&
              msg.getReceiverId() === guid) {
            const transformed = transformMessage(msg);
            if (transformed) {
              setMessages((prev) => {
                // Deduplicate
                if (prev.some((m) => m.id === transformed.id)) return prev;
                return [...prev, transformed];
              });
              setUnreadCount((c) => c + 1);
            }
          }
        },
      })
    );

    // Set up typing listener
    const typingListenerId = `typing-${guid}-${Date.now()}`;
    typingListenerIdRef.current = typingListenerId;

    CometChat.addMessageListener(
      typingListenerId,
      new CometChat.MessageListener({
        onTypingStarted: (indicator: CometChat.TypingIndicator) => {
          if (indicator.getReceiverId() === guid) {
            const name = indicator.getSender().getName();
            setTypingUsers((prev) =>
              prev.includes(name) ? prev : [...prev, name]
            );
          }
        },
        onTypingEnded: (indicator: CometChat.TypingIndicator) => {
          if (indicator.getReceiverId() === guid) {
            const name = indicator.getSender().getName();
            setTypingUsers((prev) => prev.filter((u) => u !== name));
          }
        },
      })
    );

    // Cross-tab / cross-window real-time synchronization
    let channel: BroadcastChannel | null = null;
    if (typeof window !== "undefined" && "BroadcastChannel" in window) {
      channel = new BroadcastChannel(`incidentroom-${guid}`);
      channel.onmessage = (event) => {
        if (event.data?.type === "NEW_MESSAGE" && event.data?.message) {
          const incoming = event.data.message as ChatMessage;
          setMessages((prev) => {
            if (prev.some((m) => m.id === incoming.id)) return prev;
            return [...prev, incoming];
          });
          setUnreadCount((c) => c + 1);
        } else if (event.data?.type === "TYPING") {
          const { user, isTyping } = event.data;
          setTypingUsers((prev) =>
            isTyping ? (prev.includes(user) ? prev : [...prev, user]) : prev.filter((u) => u !== user)
          );
        }
      };
    }

    return () => {
      CometChat.removeMessageListener(listenerId);
      CometChat.removeMessageListener(typingListenerId);
      if (channel) channel.close();
    };
  }, [guid, loadMessages]);

  const sendMessage = useCallback(
    async (text: string, metadata?: Record<string, unknown>) => {
      if (!guid) return;
      try {
        const sent = await sendGroupMessage(guid, text, metadata);
        const transformed = transformMessage(sent);
        if (transformed) {
          setMessages((prev) => {
            if (prev.some((m) => m.id === transformed.id)) return prev;
            return [...prev, transformed];
          });

          // Broadcast across tabs/windows for multi-operator demos
          if (typeof window !== "undefined" && "BroadcastChannel" in window) {
            const channel = new BroadcastChannel(`incidentroom-${guid}`);
            channel.postMessage({ type: "NEW_MESSAGE", message: transformed });
            channel.close();
          }
        }
      } catch (err) {
        console.error("Failed to send message:", err);
        throw err;
      }
    },
    [guid]
  );

  const sendTypingIndicator = useCallback(
    (isTyping: boolean) => {
      if (!guid) return;
      const indicator = new CometChat.TypingIndicator(
        guid,
        CometChat.RECEIVER_TYPE.GROUP
      );
      if (isTyping) {
        CometChat.startTyping(indicator);
      } else {
        CometChat.endTyping(indicator);
      }
    },
    [guid]
  );

  const clearUnread = useCallback(() => setUnreadCount(0), []);

  // Add a local-only blocked message (visible only to sender)
  const addBlockedMessage = useCallback((text: string, secretType: string) => {
    const localMsg: ChatMessage = {
      id: `blocked-${Date.now()}`,
      uid: "__blocked__",
      name: "Secret Shield",
      text,
      sentAt: Math.floor(Date.now() / 1000),
      isSentinel: false,
      isBlocked: true,
      metadata: { _secretType: secretType },
    };
    setMessages((prev) => [...prev, localMsg]);
  }, []);

  const injectLocalMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => {
      if (prev.some((m) => m.id === msg.id)) return prev;
      return [...prev, msg];
    });
  }, []);

  return {
    messages,
    loading,
    typingUsers,
    unreadCount,
    sendMessage,
    sendTypingIndicator,
    clearUnread,
    addBlockedMessage,
    injectLocalMessage,
    reload: loadMessages,
  };
}

export function usePresence() {
  const [onlineUsers, setOnlineUsers] = useState<Set<string>>(new Set());
  const listenerIdRef = useRef<string>("");

  useEffect(() => {
    const listenerId = `presence-${Date.now()}`;
    listenerIdRef.current = listenerId;

    CometChat.addUserListener(
      listenerId,
      new CometChat.UserListener({
        onUserOnline: (user: CometChat.User) => {
          setOnlineUsers((prev) => new Set([...prev, user.getUid()]));
        },
        onUserOffline: (user: CometChat.User) => {
          setOnlineUsers((prev) => {
            const next = new Set(prev);
            next.delete(user.getUid());
            return next;
          });
        },
      })
    );

    // Seed known personas as initially online (they just logged in)
    PERSONAS.forEach((p) => {
      setOnlineUsers((prev) => new Set([...prev, p.uid]));
    });

    return () => {
      CometChat.removeUserListener(listenerId);
    };
  }, []);

  return { onlineUsers };
}
