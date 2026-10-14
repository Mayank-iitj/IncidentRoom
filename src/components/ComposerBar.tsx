"use client";

import React, { useState, useRef, useCallback, useEffect } from "react";
import { Send, Shield, Check, AlertTriangle } from "lucide-react";
import { scanSecrets, redactSecrets } from "@/lib/secretScanner";

interface ComposerBarProps {
  onSend: (text: string, metadata?: Record<string, unknown>) => Promise<void>;
  onTyping: (isTyping: boolean) => void;
  onSecretBlocked: (text: string, secretType: string, redacted: string) => void;
  disabled?: boolean;
}

export default function ComposerBar({
  onSend,
  onTyping,
  onSecretBlocked,
  disabled,
}: ComposerBarProps) {
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [secrets, setSecrets] = useState<ReturnType<typeof scanSecrets>>([]);
  const [showBlockBanner, setShowBlockBanner] = useState(false);
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Scan on every keystroke
  useEffect(() => {
    if (!text.trim()) {
      setSecrets([]);
      setShowBlockBanner(false);
      return;
    }
    const found = scanSecrets(text);
    setSecrets(found);
    setShowBlockBanner(found.length > 0);
  }, [text]);

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const val = e.target.value;
      setText(val);

      // Typing indicator
      onTyping(true);
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => onTyping(false), 2000);
    },
    [onTyping]
  );

  const handleSendOrBlock = useCallback(async () => {
    const trimmed = text.trim();
    if (!trimmed || sending || disabled) return;

    // Secret check
    const found = scanSecrets(trimmed);
    if (found.length > 0) {
      const secretType = found[0].type;
      const redacted = redactSecrets(trimmed);
      onSecretBlocked(trimmed, secretType, redacted);
      return;
    }

    setSending(true);
    try {
      await onSend(trimmed);
      setText("");
      onTyping(false);
      setSecrets([]);
      setShowBlockBanner(false);
    } catch {
      // Error handled in parent
    } finally {
      setSending(false);
      textareaRef.current?.focus();
    }
  }, [text, sending, disabled, onSend, onTyping, onSecretBlocked]);

  const handleSendRedacted = useCallback(async () => {
    const redacted = redactSecrets(text.trim());
    setSending(true);
    try {
      await onSend(`[Redacted by Shield] ${redacted}`);
      setText("");
      setSecrets([]);
      setShowBlockBanner(false);
      onTyping(false);
    } catch {
      // ignore
    } finally {
      setSending(false);
    }
  }, [text, onSend, onTyping]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        handleSendOrBlock();
      }
    },
    [handleSendOrBlock]
  );

  const hasSecrets = secrets.length > 0;
  const secretType = hasSecrets ? secrets[0].type : null;

  return (
    <div className="border-t border-white/10 bg-[#0a0a0a]/90 backdrop-blur-md">
      {/* Secret warning banner with shake */}
      {showBlockBanner && (
        <div className="px-4 py-2.5 flex items-center gap-3 text-xs font-mono animate-shake bg-rose-500/10 border-b border-rose-500/30 text-[#f43f5e]">
          <Shield className="w-4 h-4 flex-shrink-0 text-[#f43f5e]" />
          <span className="font-bold">
            SECRET DETECTED: {secretType?.toUpperCase()}.
          </span>
          <span className="text-[#fca5a5]/80 hidden sm:inline">
            This message will be blocked live.
          </span>
          <button
            onClick={handleSendRedacted}
            className="ml-auto flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-bold transition-all bg-[#10b981]/15 text-[#10b981] border border-[#10b981]/30 hover:bg-[#10b981]/25"
          >
            <Check className="w-3.5 h-3.5" />
            Send Redacted
          </button>
        </div>
      )}

      {/* Input box */}
      <div className="p-3.5 flex items-end gap-2.5">
        <div className="flex-1 relative">
          <textarea
            ref={textareaRef}
            id="composer-textarea"
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            placeholder="Type incident update... (Keystroke Shield active)"
            disabled={disabled || sending}
            rows={1}
            className={`w-full resize-none outline-none text-sm px-4 py-2.5 rounded-xl transition-all font-sans leading-relaxed text-[#ebebeb] ${
              hasSecrets
                ? "bg-rose-500/5 border border-rose-500/40 text-rose-200"
                : "bg-white/[0.04] border border-white/10 focus:border-[#ccff00]/40 focus:ring-1 focus:ring-[#ccff00]/20"
            }`}
            style={{
              minHeight: "42px",
              maxHeight: "120px",
            }}
            onInput={(e) => {
              const t = e.target as HTMLTextAreaElement;
              t.style.height = "auto";
              t.style.height = Math.min(t.scrollHeight, 120) + "px";
            }}
          />
        </div>

        <button
          id="btn-send"
          onClick={handleSendOrBlock}
          disabled={!text.trim() || sending || disabled}
          className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all font-bold ${
            hasSecrets
              ? "bg-rose-500/20 text-[#f43f5e] border border-rose-500/40 shadow-[0_0_15px_rgba(244,63,94,0.3)]"
              : "bg-[#ccff00] text-black shadow-[0_0_20px_rgba(204,255,0,0.3)] hover:scale-105 disabled:opacity-30 disabled:scale-100"
          }`}
          title={hasSecrets ? "Secret detected — will be blocked" : "Send message"}
        >
          {hasSecrets ? (
            <Shield className="w-5 h-5" />
          ) : sending ? (
            <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
          ) : (
            <Send className="w-4 h-4 fill-black" />
          )}
        </button>
      </div>

      <div className="pb-2.5 px-4 flex items-center justify-between text-[11px] font-mono text-white/30">
        <span>Enter to send · Shift+Enter for newline</span>
        <span className="text-[#ccff00]/80">SECRET SHIELD ARMED</span>
      </div>
    </div>
  );
}
