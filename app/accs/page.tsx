"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

/* ===== Shared site config (match Home) ===== */
const SERVER_NAME = "Verum's Shop";
const INVITE_LINK = "https://discord.gg/nq3g55wAhH";
const LOGO_SRC = "/verumsshops.png";

/* ===== Types ===== */
type EmbedField = { name?: string; value?: string; inline?: boolean };
type AccEmbed = {
  id: string;
  channelId: string;
  url?: string;
  color?: number | null;
  title?: string | null;
  description?: string | null;
  author?: { name?: string | null; icon_url?: string | null } | null;
  footer?: { text?: string | null; icon_url?: string | null } | null;
  thumbnail?: { url?: string | null } | null;
  image?: { url?: string | null } | null;
  fields?: EmbedField[] | null;
  timestamp?: string | null;
};

/* ===== Shortcode → Unicode (before parsing) ===== */
function applyShortcodes(s: string) {
  const map: Record<string, string> = {
    ":money_with_wings:": "💸",
    ":credit_card:": "💳",
    ":moneybag:": "💰",
    ":diamond_shape_with_a_dot_inside:": "💠",
  };
  return s.replace(/:[a-z0-9_]+:/gi, (m) => map[m] ?? m);
}

/* ===== Discord text→HTML (safe) ===== */
function escapeHtml(s: string) {
  return s
    .replaceAll(/&/g, "&amp;")
    .replaceAll(/</g, "&lt;")
    .replaceAll(/>/g, "&gt;")
    .replaceAll(/"/g, "&quot;")
    .replaceAll(/'/g, "&#39;");
}

function discordToHtml(raw: string) {
  // translate shortcodes first
  let s = applyShortcodes(raw);
  // then escape
  s = escapeHtml(s);

  // Custom emojis (static and animated)
  s = s.replace(
    /&lt;:(\w+):(\d+)&gt;/g,
    (_, name, id) =>
      `<img src="https://cdn.discordapp.com/emojis/${id}.png?size=24&quality=lossless" alt="${name}" class="inline h-4 w-4 align-[-2px]" />`
  );
  s = s.replace(
    /&lt;a:(\w+):(\d+)&gt;/g,
    (_, name, id) =>
      `<img src="https://cdn.discordapp.com/emojis/${id}.gif?size=24&quality=lossless" alt="${name}" class="inline h-4 w-4 align-[-2px]" />`
  );

  // Basic markdown
  s = s.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");
  s = s.replace(/__(.+?)__/g, "<u>$1</u>");
  s = s.replace(/(^|[\s(])\*(?!\s)([^*]+?)\*(?=[\s).,!?]|$)/g, "$1<em>$2</em>");

  // Line breaks
  s = s.replace(/\n/g, "<br/>");
  return { __html: s };
}

function RenderDiscord({ text, className }: { text?: string | null; className?: string }) {
  if (!text) return null;
  return <div className={className} dangerouslySetInnerHTML={discordToHtml(text)} />;
}

/* ===== Helpers: skip empty/pipe-only fields & group inline fields ===== */
function isMeaningful(text?: string | null) {
  if (!text) return false;
  // treat pipes-only and whitespace as empty
  const t = applyShortcodes(text).replace(/[|]/g, "").replace(/\s+/g, " ").trim();
  return t.length > 0;
}

function normalizeFields(fields?: EmbedField[] | null): EmbedField[] {
  return (fields ?? []).filter((f) => isMeaningful(f?.name) || isMeaningful(f?.value));
}

/** Group consecutive inline fields together so we can render them on one row */
function groupFields(fields: EmbedField[]) {
  const groups: Array<{ inline: boolean; items: EmbedField[] }> = [];
  let i = 0;
  while (i < fields.length) {
    const f = fields[i];
    if (f.inline) {
      const row: EmbedField[] = [];
      while (i < fields.length && fields[i].inline) {
        row.push(fields[i]);
        i++;
      }
      groups.push({ inline: true, items: row });
    } else {
      groups.push({ inline: false, items: [f] });
      i++;
    }
  }
  return groups;
}

/* ===== Page ===== */
export default function AccsPage() {
  const [embeds, setEmbeds] = useState<AccEmbed[]>([]);
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        const r = await fetch("/api/accs?category=1394881220705390592", { cache: "no-store" });
        if (!r.ok) throw new Error(`Failed: ${r.status}`);
        const data = await r.json();
        setEmbeds(data?.embeds || []);
      } catch (e: any) {
        setErr(e?.message ?? "Failed to load embeds.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  return (
    <div className="min-h-screen bg-black text-zinc-100">
      {/* Header (same as Home) */}
      <header className="sticky top-0 z-20 border-b border-zinc-900/80 bg-black/70 backdrop-blur">
        <nav className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={LOGO_SRC} alt="logo" className="h-7 w-7 rounded object-cover" />
            <span className="text-sm tracking-wide text-zinc-300">{SERVER_NAME}</span>
          </div>
          <div className="hidden md:flex items-center gap-1 text-sm">
            <a href="/" className="px-3 py-2 rounded-md hover:bg-zinc-900">Home</a>
            <a href="/rep" className="px-3 py-2 rounded-md hover:bg-zinc-900">Rep</a>
            <a href="/accs" className="px-3 py-2 rounded-md hover:bg-zinc-900">Accs</a>
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

      {/* Content */}
      <div className="mx-auto max-w-6xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-6">Accounts</h1>
        {err && <p className="text-sm text-red-400 mb-6">{err}</p>}

        {loading ? (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-64 rounded-2xl border border-zinc-800 bg-zinc-950 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {embeds.map((em) => (
              <EmbedCard key={em.id} em={em} />
            ))}
            {!embeds.length && <p className="text-zinc-400">No embed posts found under that category.</p>}
          </div>
        )}
      </div>
    </div>
  );
}

/* ===== Card (single continuous body, no bubbles) ===== */
function EmbedCard({ em }: { em: AccEmbed }) {
  const accent = typeof em.color === "number" ? `#${em.color.toString(16).padStart(6, "0")}` : "#5865f2";
  const fields = normalizeFields(em.fields);
  const groups = groupFields(fields);

  return (
    <Card className="bg-zinc-950 border border-zinc-800 rounded-2xl shadow-sm">
      <CardContent className="p-0">
        <div className="flex">
          {/* left rail */}
          <div className="w-1.5 rounded-l-2xl" style={{ backgroundColor: accent }} />
          <div className="relative flex-1 p-4">
            {/* top-right thumbnail (nudged higher) */}
            {em.thumbnail?.url && (
              <img
                src={em.thumbnail.url}
                className="absolute right-4 top-1 h-16 w-16 object-contain"
                alt=""
              />
            )}

            {/* Header row */}
            <div className="mb-2 flex items-center gap-2 pr-24">
              <div className="text-base font-semibold text-zinc-100">
                <RenderDiscord text={em.title || "Account Information"} />
              </div>
              <span className="ml-auto text-xs text-zinc-400 shrink-0">
                {em.timestamp ? new Date(em.timestamp).toLocaleString() : ""}
              </span>
            </div>

            {/* Body: ONE continuous area */}
            <div className="text-sm leading-relaxed text-zinc-300 space-y-2">
              {/* Description (if present) */}
              {em.description && <RenderDiscord text={em.description} />}

              {/* Fields */}
              {groups.map((g, gi) =>
                g.inline ? (
                  // Inline group: render items next to each other (no boxes), wrapping as needed
                  <div key={gi} className="flex flex-wrap gap-x-8 gap-y-1">
                    {g.items.map((f, fi) => (
                      <div key={fi} className="min-w-[200px] shrink-0">
                        {isMeaningful(f?.name) && (
                          <span className="font-semibold text-zinc-200">
                            <RenderDiscord text={f.name} />
                          </span>
                        )}
                        {isMeaningful(f?.value) && (
                          <span className="ml-2">
                            <RenderDiscord text={f.value} />
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  // Block field: label on one line, value below (no box)
                  <div key={gi}>
                    {isMeaningful(g.items[0]?.name) && (
                      <div className="font-semibold text-zinc-200">
                        <RenderDiscord text={g.items[0].name} />
                      </div>
                    )}
                    {isMeaningful(g.items[0]?.value) && (
                      <div>
                        <RenderDiscord text={g.items[0].value} />
                      </div>
                    )}
                  </div>
                )
              )}

              {/* Large image (rare) */}
              {em.image?.url && (
                <img
                  src={em.image.url}
                  className="mt-2 max-h-64 rounded-md border border-zinc-800"
                  alt=""
                />
              )}
            </div>

            {/* Footer — hide branded line */}
            {em.footer?.text && !/noemt/i.test(em.footer.text) && (
              <div className="mt-3 flex items-center gap-2 text-xs text-zinc-400">
                {em.footer.icon_url && <img src={em.footer.icon_url} className="h-4 w-4 rounded" alt="" />}
                <span className="truncate">
                  <RenderDiscord text={em.footer.text} />
                </span>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
