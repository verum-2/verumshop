"use client";

import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { ShieldCheck } from "lucide-react";

/* ================= CONFIG ================= */

const SERVER_NAME = "Verum's Shop";
const INVITE_LINK = "https://discord.gg/nq3g55wAhH";
const LOGO_SRC = "/verumsshops.png";

type Member = { id: string; name: string; avatar?: string };
type StaffBuckets = {
  owner: Member[];
  coOwner: Member[];
  pengu: Member[];
  seller: Member[];
};

const fade = {
  initial: { opacity: 0, y: 10 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5, ease: "easeOut" },
};

/* ================= PAGE ================= */

export default function HomePage() {
  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Header */}
      <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-black/70 backdrop-blur">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_SRC} alt="logo" className="h-7 w-7 rounded object-cover" />
            <span className="text-sm tracking-wide text-zinc-300">{SERVER_NAME}</span>
          </div>

          {/* NAV LINKS (md and up) */}
          <div className="hidden md:flex items-center gap-1 text-sm">
            <a href="/" className="px-3 py-2 rounded-md hover:bg-zinc-900">Home</a>
            <a href="/rep" className="px-3 py-2 rounded-md hover:bg-zinc-900">Rep</a>
            <a href="/accs" className="px-3 py-2 rounded-md hover:bg-zinc-900">Accs</a> {/* NEW */}
          </div>

          <a
            href={INVITE_LINK}
            target="_blank"
            rel="noreferrer"
            className="rounded-full bg-zinc-800 text-white hover:bg-zinc-700 px-4 py-1.5 text-sm"
          >
            Join
          </a>
        </nav>
      </header>

      {/* Hero */}
      <section id="home" className="mx-auto max-w-6xl px-4">
        <motion.div {...fade} className="py-16 md:py-24 flex flex-col gap-6 items-start">
          <img src={LOGO_SRC} alt="logo" className="h-44 w-44 rounded object-cover" />
          <h1 className="text-3xl md:text-4xl font-medium tracking-tight">{SERVER_NAME}</h1>
          <div className="text-zinc-300 text-lg leading-relaxed max-w-prose">
            <p>Welcome to Verum&apos;s Shop.</p>
            <p>Buy and sell Skyblock Accounts with us.</p>
            <p>We also sell coins 35$ per billion.</p>
          </div>
          <p className="text-zinc-500 text-sm">Must follow Tos at all times.</p>
          <div className="flex gap-3">
            <a
              href={INVITE_LINK}
              target="_blank"
              rel="noreferrer"
              className="rounded-full bg-zinc-800 text-white hover:bg-zinc-700 px-4 py-2 text-sm"
            >
              Accept Invite
            </a>
            <a
              href="/rep"
              className="rounded-full border border-zinc-700 text-zinc-300 hover:bg-zinc-900 px-4 py-2 text-sm"
            >
              View Rep
            </a>
          </div>
        </motion.div>
      </section>

      {/* Staff grid ABOVE verify */}
      <section className="mx-auto max-w-6xl px-4 pb-16">
        <StaffGrid />
        <VerifySeller />
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900">
        <div className="mx-auto max-w-6xl px-4 py-10 flex items-center justify-between">
          <div className="flex items-center gap-3 text-sm text-zinc-500">
            <img src={LOGO_SRC} alt="logo" className="h-5 w-5 rounded object-cover" />
            <span>© {new Date().getFullYear()} {SERVER_NAME}</span>
          </div>
          <a
            href={INVITE_LINK}
            target="_blank"
            rel="noreferrer"
            className="text-sm text-zinc-400 hover:text-zinc-200"
          >
            Join
          </a>
        </div>
      </footer>
    </div>
  );
}

/* ================= VERIFY (seller-focused) ================= */

function VerifySeller() {
  const [id, setId] = useState("");
  const [res, setRes] = useState<null | {
    ok: boolean; isSeller: boolean;
    role?: string | null; name?: string; avatar?: string; status?: string | null;
    message?: string;
  }>(null);
  const [loading, setLoading] = useState(false);

  async function onCheck() {
    if (!id.trim()) return;
    setLoading(true); setRes(null);
    try {
      const r = await fetch(`/api/staff-check?id=${encodeURIComponent(id.trim())}`, { cache: "no-store" });
      const data = await r.json();
      setRes(data);
    } catch {
      setRes({ ok:false, isSeller:false, message:"Error contacting server" });
    } finally { setLoading(false); }
  }

  return (
    <Card className="bg-zinc-950 border-zinc-900 mt-10">
      <CardContent className="p-5 space-y-4">
        <div className="flex items-center gap-2 text-zinc-300 font-medium">
          <ShieldCheck className="h-4 w-4" /> Verify a Seller / Staff
        </div>
        <div className="flex gap-2">
          <input
            value={id}
            onChange={(e) => setId(e.target.value)}
            placeholder="Enter Discord ID"
            className="flex-1 bg-black border border-zinc-700 px-3 py-2 rounded-md text-sm text-zinc-200 outline-none focus:border-zinc-500"
          />
          <Button onClick={onCheck} disabled={loading} className="rounded-full bg-zinc-800 hover:bg-zinc-700">
            {loading ? "Checking…" : "Check"}
          </Button>
        </div>

        {res && (
          <div
            className={`mt-2 inline-flex items-center gap-3 rounded-full px-3 py-2 text-sm border
            ${res.isSeller
              ? "bg-green-900/20 text-green-300 border-green-800"
              : "bg-red-900/20 text-red-300 border-red-800"}`}
          >
            {res.avatar && <img src={res.avatar} alt="" className="h-8 w-8 rounded-full" />}
            <div className="flex flex-col">
              <span className="font-medium">
                {res.isSeller
                  ? "This is a Seller."
                  : "Don’t deal with this user — it’s not one of our sellers."}
              </span>
              {(res?.name || res?.status) && (
                <span className="text-xs text-zinc-400">
                  {res.name}{res.status ? ` • ${res.status}` : ""}
                </span>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/* ================= STAFF GRID (avatar bubbles) ================= */

function StaffGrid() {
  const [staff, setStaff] = useState<StaffBuckets | null>(null);
  const [err, setErr] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/staff", { cache: "no-store" });
        if (!r.ok) throw new Error(`${r.status}`);
        setStaff(await r.json());
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load staff.");
      }
    })();
  }, []);

  const chip = (m: Member) => (
    <span
      key={m.id}
      className="inline-flex items-center rounded-full bg-zinc-900/70 px-2.5 py-1 text-sm text-zinc-200 mr-2 mb-2 border border-zinc-800"
    >
      {m.avatar && <img src={m.avatar} alt="" className="h-5 w-5 rounded-full mr-2" />}
      {m.name}
    </span>
  );

  const card = (title: string, items?: Member[]) => (
    <Card className="bg-zinc-950 border-zinc-900">
      <CardContent className="p-4">
        <div className="text-xs uppercase tracking-wider text-zinc-400 mb-3">{title}</div>
        <div className="flex flex-wrap min-h-[40px]">
          {items?.length ? items.map(chip) : (
            <div className="h-8 w-full rounded bg-zinc-900/60 border border-zinc-800" />
          )}
        </div>
      </CardContent>
    </Card>
  );

  return (
    <>
      <h2 className="text-lg font-medium mb-6">Staff Team</h2>
      {err && <p className="text-sm text-red-400 mb-6">{err}</p>}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {card("Owner",  staff?.owner)}
        {card("Co-Owner", staff?.coOwner)}
        {card("Pengu",  staff?.pengu)}
        {card("Seller", staff?.seller)}
      </div>
    </>
  );
}
