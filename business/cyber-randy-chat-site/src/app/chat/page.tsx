"use client";

import { useEffect, useMemo, useState } from "react";
import { createClient } from "../supabase/client";

type Profile = { id: string; handle: string; starred: boolean };
type Message = { id: string; created_at: string; handle: string; body: string; user_id: string };

const BOT_HANDLE = "@cyber_randy";

export default function ChatPage() {
  const supabase = useMemo(() => createClient(), []);
  const [mounted, setMounted] = useState(false);
  const [me, setMe] = useState<{ id: string; email?: string } | null>(null);
  const [profiles, setProfiles] = useState<Profile[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<string>("");

  useEffect(() => {
    setMounted(true);
    if (!supabase) {
      setStatus("Supabase not connected yet. Deploy on Vercel + add Supabase integration first.");
      return;
    }
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      if (!u) {
        setStatus("Not logged in. Register/login first.");
        return;
      }
      setMe({ id: u.id, email: u.email ?? undefined });

      // ensure profile exists
      const handle = u.email ? `@${u.email.split("@")[0]}` : `@user_${u.id.slice(0, 6)}`;
      supabase
        .from("cr_profiles")
        .upsert({ id: u.id, handle }, { onConflict: "id" })
        .then(() => {
          // no-op
        });
    });
  }, [supabase]);

  async function load() {
    if (!supabase) return;
    const [{ data: p }, { data: m }] = await Promise.all([
      supabase.from("cr_profiles").select("id,handle,starred").order("created_at", { ascending: true }),
      supabase
        .from("cr_messages")
        .select("id,created_at,handle,body,user_id")
        .order("created_at", { ascending: true })
        .limit(200),
    ]);
    setProfiles((p as any) || []);
    setMessages((m as any) || []);
  }

  useEffect(() => {
    if (!supabase) return;
    load();
    const channel = supabase
      .channel("cr_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cr_messages" },
        (payload) => {
          setMessages((cur) => [...cur, payload.new as any]);
        }
      )
      .subscribe();
    return () => {
      supabase.removeChannel(channel);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function send() {
    if (!me) {
      setStatus("Login required");
      return;
    }
    if (!supabase) {
      setStatus("Supabase not connected yet. Deploy on Vercel + add Supabase integration first.");
      return;
    }
    const body = text.trim();
    if (!body) return;

    setText("");
    setStatus("");

    const myProfile = profiles.find((p) => p.id === me.id);
    const handle = myProfile?.handle || (me.email ? `@${me.email.split("@")[0]}` : "@anon");

    const { error } = await supabase.from("cr_messages").insert({ user_id: me.id, handle, body });
    if (error) setStatus(error.message);

    // Bot behavior v0:
    // - only respond when tagged
    // - only respond if author is starred
    if (body.includes(BOT_HANDLE)) {
      const starred = !!myProfile?.starred;
      if (!starred) {
        // silently ignore (per spec)
      } else {
        // placeholder response until we wire this to OpenClaw/xAI
        await supabase.from("cr_messages").insert({
          user_id: me.id,
          handle: BOT_HANDLE,
          body:
            "(bot online) I saw the tag. Bot replies will be wired to the real agent next — for now this is a stub.",
        });
      }
    }
  }

  if (!mounted) return null;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div style={{ fontWeight: 700 }}>Users</div>
        <div style={{ marginTop: 10, display: "flex", flexDirection: "column", gap: 8 }}>
          {profiles.map((p) => (
            <div key={p.id} className="card" style={{ padding: 10 }}>
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <div>{p.handle}</div>
                <div title={p.starred ? "starred" : "unstarred"}>{p.starred ? "★" : "☆"}</div>
              </div>
            </div>
          ))}
        </div>
      </aside>

      <main className="main">
        <div className="topbar">
          <div>
            <b>Bot Team Chat</b> <span style={{ opacity: 0.7 }}>tag {BOT_HANDLE} to talk to the bot</span>
          </div>
          <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <a href="/register">Register</a>
            <a href="/">Home</a>
          </div>
        </div>

        <div className="feed">
          {messages.map((m) => (
            <div key={m.id} className="msg">
              <div className="msgMeta">
                <b>{m.handle}</b> · <span suppressHydrationWarning>{new Date(m.created_at).toLocaleString()}</span>
              </div>
              <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
            </div>
          ))}
        </div>

        <div className="composer">
          <input
            className="input"
            placeholder={me ? "Write a message…" : "Login required"}
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) send();
            }}
            disabled={!me}
          />
          <button className="button" onClick={send} disabled={!me}>
            Send
          </button>
        </div>
        {status ? <div style={{ padding: "0 16px 12px", opacity: 0.8 }}>{status}</div> : null}
      </main>
    </div>
  );
}
