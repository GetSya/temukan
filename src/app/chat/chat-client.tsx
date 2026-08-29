"use client";
import { useEffect, useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Send, MessageCircle, Search, ArrowLeft, MoreVertical } from "lucide-react";
import { toast } from "sonner";

type Conversation = {
  id: string;
  participants: string[];
  reportId?: string | null;
  updatedAt: string;
  lastMessage?: string;
  otherUser: { id: string; name: string; avatar: string | null } | null;
  unread: number;
};

type Message = {
  id: string;
  conversationId: string;
  senderId: string;
  text: string;
  createdAt: string;
  read: boolean;
};

export function ChatClient({ initialConversationId, currentUserId }: { initialConversationId: string | null; currentUserId: string; currentUserName: string }) {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(initialConversationId);
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [searchQ, setSearchQ] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const isAtBottomRef = useRef(true);
  const prevLenRef = useRef(0);

  async function fetchConversations() {
    const res = await fetch(`/api/chat/conversations?t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setConversations(data.conversations || []);
    }
  }

  async function fetchMessages(id: string, isPoll = false) {
    if (!isPoll) setLoading(true);
    const res = await fetch(`/api/chat/messages?conversationId=${id}&t=${Date.now()}`, { cache: "no-store" });
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages || []);
    }
    if (!isPoll) setLoading(false);
  }

  useEffect(() => { fetchConversations(); }, []);
  useEffect(() => {
    if (selectedId) {
      fetchMessages(selectedId);
      const interval = setInterval(() => fetchMessages(selectedId, true), 1500);
      // also refetch when tab becomes visible
      const onVisible = () => { if (document.visibilityState === "visible") fetchMessages(selectedId, true); };
      document.addEventListener("visibilitychange", onVisible);
      window.addEventListener("focus", onVisible as any);
      return () => {
        clearInterval(interval);
        document.removeEventListener("visibilitychange", onVisible);
        window.removeEventListener("focus", onVisible as any);
      };
    }
  }, [selectedId]);

  useEffect(() => {
    fetchConversations();
    const iv = setInterval(() => fetchConversations(), 2000);
    const onVisible = () => { if (document.visibilityState === "visible") fetchConversations(); };
    document.addEventListener("visibilitychange", onVisible);
    window.addEventListener("focus", onVisible as any);
    return () => {
      clearInterval(iv);
      document.removeEventListener("visibilitychange", onVisible);
      window.removeEventListener("focus", onVisible as any);
    };
  }, []);

  // smart auto-scroll: only if user was near bottom or initial load, not when reading history
  useEffect(() => {
    const isInitial = prevLenRef.current === 0 && messages.length > 0;
    const hasNewMessage = messages.length > prevLenRef.current;
    const shouldScroll = isInitial || (hasNewMessage && isAtBottomRef.current);
    if (shouldScroll) bottomRef.current?.scrollIntoView({ behavior: "smooth" });
    prevLenRef.current = messages.length;
  }, [messages]);
  // reset when switching conversation
  useEffect(() => { prevLenRef.current = 0; isAtBottomRef.current = true; }, [selectedId]);

  async function send() {
    if (!text.trim() || !selectedId) return;
    setSending(true);
    isAtBottomRef.current = true;
    const res = await fetch("/api/chat/messages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ conversationId: selectedId, text: text.trim() }),
    });
    const j = await res.json().catch(()=>({}));
    if (!res.ok) toast.error(j.error || "Gagal mengirim");
    else {
      setText("");
      fetchMessages(selectedId);
      fetchConversations();
      // force scroll to bottom after sending
      setTimeout(() => bottomRef.current?.scrollIntoView({ behavior: "smooth" }), 100);
    }
    setSending(false);
  }

  const filtered = conversations.filter(c => !searchQ || c.otherUser?.name.toLowerCase().includes(searchQ.toLowerCase()) || c.lastMessage?.toLowerCase().includes(searchQ.toLowerCase()));
  const selectedConv = conversations.find((c) => c.id === selectedId);

  return (
    <div className="flex flex-1 overflow-hidden bg-white">
      {/* Sidebar */}
      <div className={`${selectedId ? "hidden md:flex" : "flex"} w-full md:w-[380px] shrink-0 flex-col border-r border-stone-200 bg-white`}>
        {/* Sidebar header */}
        <div className="h-[64px] px-4 flex items-center gap-3 border-b bg-white shrink-0">
          <div className="w-9 h-9 rounded-full bg-primary text-white flex items-center justify-center font-medium text-sm">P</div>
          <div className="flex-1 min-w-0">
            <div className="font-semibold text-sm leading-tight">Pesan</div>
            <div className="text-xs text-muted-foreground">{conversations.length} percakapan</div>
          </div>
          <Button variant="ghost" size="icon" className="rounded-full" aria-label="Menu"><MoreVertical className="w-5 h-5" /></Button>
        </div>

        <div className="p-3 border-b bg-white">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400" />
            <Input value={searchQ} onChange={e=> setSearchQ(e.target.value)} placeholder="Cari percakapan..." className="pl-9 h-10 rounded-full bg-stone-100 border-0 focus-visible:ring-1" />
          </div>
        </div>

        <div className="flex-1 overflow-auto">
          {filtered.length === 0 ? (
            <div className="p-8 text-center text-sm text-muted-foreground">
              <Search className="w-10 h-10 mx-auto text-stone-300 mb-3" />
              {searchQ ? `Tidak ada hasil untuk "${searchQ}"` : "Belum ada percakapan. Buka laporan lalu klik Chat Pemilik."}
            </div>
          ) : (
            filtered.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-3 py-3 flex gap-3 hover:bg-stone-50 transition border-b border-stone-100 last:border-0 ${selectedId===c.id ? "bg-stone-100" : ""}`}
              >
                <div className="w-12 h-12 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm shrink-0">
                  {c.otherUser?.name?.[0] || "?"}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm truncate">{c.otherUser?.name || "Pengguna"}</span>
                    <span className="ml-auto text-xs text-muted-foreground shrink-0">{new Date(c.updatedAt).toLocaleDateString("id-ID", { day:"2-digit", month:"short"})}</span>
                  </div>
                  <div className="text-sm text-muted-foreground truncate flex items-center gap-1">
                    {c.unread>0 && <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />}
                    <span className="truncate">{c.lastMessage || "Belum ada pesan"}</span>
                  </div>
                  {c.reportId && <div className="text-xs text-primary truncate">Laporan #{c.reportId.slice(0,8)}</div>}
                </div>
                {c.unread>0 && <span className="bg-emerald-600 text-white text-xs rounded-full min-w-5 h-5 px-1.5 flex items-center justify-center font-medium shrink-0 self-center">{c.unread}</span>}
              </button>
            ))
          )}
        </div>
        <div className="p-3 border-t bg-stone-50 text-xs text-muted-foreground text-center hidden md:block">Chat aman • Jaga privasi • Maks 2000 karakter</div>
      </div>

      {/* Main */}
      <div className={`${!selectedId ? "hidden md:flex" : "flex"} flex-1 flex-col bg-[#f0f0f0] relative`}>
        {!selectedId ? (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#f8f7f5]">
            <div className="w-20 h-20 rounded-full bg-white border shadow-sm flex items-center justify-center mb-4">
              <MessageCircle className="w-10 h-10 text-stone-300" />
            </div>
            <h3 className="font-semibold">Pilih percakapan</h3>
            <p className="text-sm text-muted-foreground mt-1 max-w-sm">Pilih dari daftar di sebelah kiri untuk mulai chat. Chat terhubung ke laporan agar konteks tetap jelas.</p>
          </div>
        ) : (
          <>
            {/* Chat header */}
            <div className="h-[64px] px-4 flex items-center gap-3 border-b bg-white shrink-0">
              <Button variant="ghost" size="icon" className="md:hidden rounded-full -ml-1" onClick={()=> setSelectedId(null)} aria-label="Kembali"><ArrowLeft className="w-5 h-5" /></Button>
              <div className="w-10 h-10 rounded-full bg-stone-900 text-white flex items-center justify-center text-sm">{selectedConv?.otherUser?.name?.[0] || "?"}</div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">{selectedConv?.otherUser?.name || "Pengguna"}</div>
                <div className="text-xs text-emerald-600">Online • Chat aman</div>
              </div>
              <Button variant="ghost" size="icon" className="rounded-full" aria-label="Opsi"><MoreVertical className="w-5 h-5" /></Button>
            </div>

            {/* Messages */}
            <div
              ref={scrollRef}
              onScroll={(e) => {
                const el = e.currentTarget;
                const nearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 120;
                isAtBottomRef.current = nearBottom;
              }}
              className="flex-1 overflow-auto p-4 md:p-6 space-y-2 bg-[#efeae2] bg-[radial-gradient(#e7e5e4_1px,transparent_1px)] [background-size:16px_16px]">
              {loading ? <p className="text-xs text-muted-foreground text-center py-8">Memuat pesan...</p> : messages.length===0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-center">
                  <div className="bg-white rounded-2xl shadow-sm border p-6 max-w-sm">
                    <p className="text-sm font-medium">Belum ada pesan</p>
                    <p className="text-xs text-muted-foreground mt-1">Sapa dulu 👋 — awali dengan konteks laporan agar dibalas cepat.</p>
                  </div>
                </div>
              ) : messages.map((m)=> {
                const isMe = m.senderId===currentUserId;
                return (
                  <div key={m.id} className={`flex ${isMe? "justify-end":"justify-start"}`}>
                    <div className={`max-w-[78%] md:max-w-[60%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed shadow-sm border ${isMe? "bg-[#dcf8c6] border-[#cdebb3] rounded-br-sm" : "bg-white border-stone-200 rounded-bl-sm"}`}>
                      <span className="whitespace-pre-wrap break-words">{m.text}</span>
                      <div className={`text-xs mt-1 flex items-center gap-1 justify-end ${isMe? "text-stone-500":"text-muted-foreground"}`}>{new Date(m.createdAt).toLocaleTimeString("id-ID", { hour:"2-digit", minute:"2-digit"})}{isMe && (m.read ? " • dibaca" : " • terkirim")}</div>
                    </div>
                  </div>
                );
              })}
              <div ref={bottomRef} />
            </div>

            {/* Composer */}
            <div className="p-3 md:p-4 border-t bg-white flex gap-2 items-end shrink-0">
              <div className="flex-1 relative">
                <Input
                  value={text}
                  onChange={(e)=> setText(e.target.value)}
                  onKeyDown={(e)=> { if (e.key==="Enter" && !e.shiftKey) { e.preventDefault(); send(); }}}
                  placeholder="Tulis pesan..."
                  className="min-h-11 h-11 rounded-full bg-stone-100 border-0 pr-12 focus-visible:ring-1"
                  maxLength={2000}
                  aria-label="Tulis pesan"
                />
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground hidden sm:block">{text.length}/2000</span>
              </div>
              <Button onClick={send} disabled={sending || !text.trim()} className="rounded-full h-11 w-11 md:w-auto md:px-6 shrink-0">
                <Send className="w-4 h-4 md:mr-2" /> <span className="hidden md:inline">{sending?"Mengirim...":"Kirim"}</span>
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
