"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare } from "lucide-react";

const INVITE_LINK = "https://discord.gg/nq3g55wAhH";
const LOGO_SRC = "/verumsshops.png";
const SERVER_NAME = "Verum's Shop";
const CHANNEL_ID = "1394861879708487790";

type RepMsg = {
  id: string;
  authorId: string;
  authorName: string;
  authorAvatar: string;
  content: string;
  timestamp: string;
};

export default function RepPage() {
  const [messages, setMessages] = useState<RepMsg[]>([]);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        setError("");
        const res = await fetch(`/api/rep?channel=${CHANNEL_ID}`, { cache: "no-store" });
        if (!res.ok) throw new Error(`API ${res.status}`);
        setMessages(await res.json());
      } catch (e: any) {
        setError(e?.message || "Failed to fetch.");
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Header (Home | Rep | Accs) */}
      <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-black/70 backdrop-blur">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {LOGO_SRC && <img src={LOGO_SRC} alt="logo" className="h-7 w-7 object-contain rounded" />}
            <span className="text-sm tracking-wide text-zinc-300">{SERVER_NAME}</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <a href="/" className="px-3 py-2 rounded-md hover:bg-zinc-900">Home</a>
            <a href="/rep" className="px-3 py-2 rounded-md hover:bg-zinc-900">Rep</a>
            <a href="/accs" className="px-3 py-2 rounded-md hover:bg-zinc-900">Accs</a>
          </div>
          <Button asChild size="sm" className="rounded-full bg-zinc-800 text-white hover:bg-zinc-700">
            <a href={INVITE_LINK} target="_blank" rel="noreferrer">Join</a>
          </Button>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 space-y-6">
        {/* Page heading */}
        <h1 className="text-2xl font-semibold mb-6">Vouches</h1>

        {error && <span className="text-red-400 text-sm">{error}</span>}

        <div className="grid md:grid-cols-3 gap-4">
          {messages.length === 0 ? (
            <Card className="bg-zinc-950 border border-zinc-800">
              <CardContent className="p-5 text-zinc-400 text-sm">No vouches yet.</CardContent>
            </Card>
          ) : (
            messages.map((m) => (
              <Card key={m.id} className="bg-zinc-950 border border-zinc-800 text-zinc-100">
                <CardContent className="p-5 space-y-3">
                  {/* Changed label */}
                  <div className="flex items-center gap-2 text-zinc-300 font-medium">
                    <MessageSquare className="h-4 w-4" /> Vouch
                  </div>

                  <div className="inline-flex items-center gap-2 bg-zinc-900/70 border border-zinc-800 px-2 py-1 rounded-full text-sm text-zinc-200">
                    {m.authorAvatar && <img src={m.authorAvatar} alt="" className="h-5 w-5 rounded-full" />}
                    <span className="text-xs font-medium">{m.authorName || m.authorId}</span>
                  </div>

                  <p className="whitespace-pre-wrap text-sm text-zinc-200">{m.content}</p>
                  <div className="flex justify-end text-xs text-zinc-500">
                    <span>{new Date(m.timestamp).toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
}
