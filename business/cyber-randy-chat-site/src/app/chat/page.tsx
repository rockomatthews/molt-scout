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

  const myProfile = me ? profiles.find((p) => p.id === me.id) : undefined;

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
    setMounted(true);
    if (!supabase) {
      setStatus("Supabase not connected yet. Check Vercel env vars for NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
      return;
    }

    // Keep auth state in sync
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      setMe(u ? { id: u.id, email: u.email ?? undefined } : null);
      setStatus(u ? "" : "Not logged in. Use Login/Register.");
      // Reload after auth transitions
      load();
    });

    // Initial user
    supabase.auth.getUser().then(({ data }) => {
      const u = data.user;
      setMe(u ? { id: u.id, email: u.email ?? undefined } : null);
      setStatus(u ? "" : "Not logged in. Use Login/Register.");
      if (u) {
        const handle = u.email ? `@${u.email.split("@")[0]}` : `@user_${u.id.slice(0, 6)}`;
        supabase.from("cr_profiles").upsert({ id: u.id, handle }, { onConflict: "id" }).then(load);
      } else {
        load();
      }
    });

    // Realtime subscription (nice-to-have). We also do optimistic append after sends.
    const channel = supabase
      .channel("cr_messages")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "cr_messages" },
        (payload) => {
          setMessages((cur) => {
            const next = payload.new as any;
            if (cur.some((m) => m.id === next.id)) return cur;
            return [...cur, next];
          });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
      sub.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function saveDisplayName(nextHandle: string) {
    if (!supabase || !me) return;
    const handle = nextHandle.trim();
    if (!handle) return;
    const normalized = handle.startsWith("@") ? handle : `@${handle}`;
    const { error } = await supabase
      .from("cr_profiles")
      .update({ handle: normalized })
      .eq("id", me.id);
    if (error) {
      setStatus(error.message);
      return;
    }
    await load();
  }

  async function logout() {
    if (!supabase) return;
    await supabase.auth.signOut();
    setMe(null);
    setStatus("Logged out.");
    window.location.href = "/login";
  }

  async function send() {
    if (!me) {
      setStatus("Login required");
      return;
    }
    if (!supabase) {
      setStatus("Supabase not connected yet.");
      return;
    }

    const body = text.trim();
    if (!body) return;

    setText("");
    setStatus("");

    const handle = myProfile?.handle || (me.email ? `@${me.email.split("@")[0]}` : "@anon");

    const { data, error } = await supabase
      .from("cr_messages")
      .insert({ user_id: me.id, handle, body })
      .select("id,created_at,handle,body,user_id")
      .single();

    if (error) {
      setStatus(error.message);
      return;
    }

    // Optimistic append (even if Realtime is off)
    if (data) setMessages((cur) => (cur.some((m) => m.id === data.id) ? cur : [...cur, data as any]));

    // Bot behavior v0:
    // - only respond when tagged
    // - only respond if author is starred
    if (body.includes(BOT_HANDLE)) {
      const starred = !!myProfile?.starred;
      if (starred) {
        const { data: botData } = await supabase
          .from("cr_messages")
          .insert({
            user_id: me.id,
            handle: BOT_HANDLE,
            body:
              "(bot online) I saw the tag. Bot replies will be wired to the real agent next — for now this is a stub.",
          })
          .select("id,created_at,handle,body,user_id")
          .single();
        if (botData)
          setMessages((cur) =>
            cur.some((m) => m.id === (botData as any).id) ? cur : [...cur, botData as any]
          );
      }
    }
  }

  if (!mounted) return null;

  return (
    <div className="shell">
      <aside className="sidebar">
        <div style={{ fontWeight: 700 }}>Users</div>

        {me ? (
          <div className="card" style={{ marginTop: 10 }}>
            <div style={{ opacity: 0.7, fontSize: 12 }}>Your display name</div>
            <input
              className="input"
              defaultValue={myProfile?.handle || (me.email ? `@${me.email.split("@")[0]}` : "")}
              onKeyDown={(e) => {
                if (e.key === "Enter") saveDisplayName((e.target as HTMLInputElement).value);
              }}
            />
            <div style={{ opacity: 0.65, fontSize: 12, marginTop: 8 }}>
              Press Enter to save. Use @cyber_randy to tag the bot.
            </div>
          </div>
        ) : null}

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
            {me ? (
              <button className="button" onClick={logout} style={{ padding: "6px 10px" }}>
                Logout
              </button>
            ) : (
              <>
                <a href="/login">Login</a>
                <a href="/register">Register</a>
              </>
            )}
            <a href="/">Home</a>
          </div>
        </div>

        <div className="feed">
          {messages.map((m) => {
            const isBot = (m.handle || "").toLowerCase() === BOT_HANDLE.toLowerCase();
            return (
              <div key={m.id} className={`msg ${isBot ? "msg--bot" : "msg--user"}`}>
                <div className="msgMeta">
                  <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                    {isBot ? (
                      <img
                        src="/cyber_randy_chat_icon.png"
                        alt="Randy"
                        style={{ width: 18, height: 18, borderRadius: 6, opacity: 0.95 }}
                      />
                    ) : null}
                    <b>{m.handle}</b>
                  </span>
                  <span style={{ opacity: 0.8 }}>
                    <span suppressHydrationWarning>{new Date(m.created_at).toLocaleString()}</span>
                  </span>
                </div>
                <div style={{ whiteSpace: "pre-wrap" }}>{m.body}</div>
              </div>
            );
          })}
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
