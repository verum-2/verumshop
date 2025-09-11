import { NextRequest, NextResponse } from "next/server";

const DISCORD_API = "https://discord.com/api/v10";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const categoryId = searchParams.get("category") ?? "1394881220705390592";
    const guildId = process.env.DISCORD_GUILD_ID!;
    const token = process.env.DISCORD_BOT_TOKEN!;

    if (!token || !guildId) {
      return NextResponse.json({ error: "Missing DISCORD_BOT_TOKEN or DISCORD_GUILD_ID" }, { status: 500 });
    }

    const headers = { Authorization: `Bot ${token}` };

    // 1) list all channels in the guild
    const chRes = await fetch(`${DISCORD_API}/guilds/${guildId}/channels`, { headers, cache: "no-store" });
    if (!chRes.ok) {
      const t = await chRes.text();
      return NextResponse.json({ error: `Discord channels error: ${chRes.status} ${t}` }, { status: 502 });
    }
    const channels: any[] = await chRes.json();

    // 2) take only text channels under the requested category
    const textChannels = channels.filter(
      (c) => c?.type === 0 && String(c?.parent_id) === String(categoryId)
    );

    // 3) fetch recent messages from each channel; collect only embeds
    const embedBuckets: any[] = [];
    for (const c of textChannels) {
      try {
        const msgsRes = await fetch(`${DISCORD_API}/channels/${c.id}/messages?limit=100`, {
          headers,
          cache: "no-store",
        });
        if (!msgsRes.ok) continue;
        const msgs: any[] = await msgsRes.json();

        for (const m of msgs) {
          if (Array.isArray(m.embeds) && m.embeds.length > 0) {
            // flatten each embed on this message to a friendlier shape
            for (const e of m.embeds) {
              embedBuckets.push({
                id: m.id,
                channelId: c.id,
                url: m?.url ?? undefined,
                color: e?.color ?? null,
                title: e?.title ?? null,
                description: e?.description ?? null,
                author: e?.author ?? null,
                footer: e?.footer ?? null,
                thumbnail: e?.thumbnail ?? null,
                image: e?.image ?? null,
                fields: e?.fields ?? null,
                timestamp: e?.timestamp ?? m?.timestamp ?? null,
              });
            }
          }
        }
      } catch {
        // ignore channel fetch errors to keep the rest working
      }
    }

    // Optional: sort newest first
    embedBuckets.sort((a, b) => {
      const ta = new Date(a.timestamp || 0).getTime();
      const tb = new Date(b.timestamp || 0).getTime();
      return tb - ta;
    });

    return NextResponse.json({ embeds: embedBuckets });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "Unknown error" }, { status: 500 });
  }
}
