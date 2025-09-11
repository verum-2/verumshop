import { NextResponse } from "next/server";

/**
 * GET /api/rep?channel=<id>
 * Needs: DISCORD_BOT_TOKEN in .env.local
 */
export async function GET(req: Request) {
  const token = process.env.DISCORD_BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "Missing DISCORD_BOT_TOKEN" }, { status: 500 });

  const { searchParams } = new URL(req.url);
  const channelId = searchParams.get("channel");
  if (!channelId) return NextResponse.json({ error: "Missing channel" }, { status: 400 });

  try {
    const r = await fetch(
      `https://discord.com/api/v10/channels/${channelId}/messages?limit=100`,
      { headers: { Authorization: `Bot ${token}` }, cache: "no-store" }
    );
    if (!r.ok) {
      const text = await r.text();
      return NextResponse.json({ error: `Discord ${r.status}: ${text}` }, { status: 502 });
    }

    const raw = (await r.json()) as any[];

    const data = raw.map((m) => {
      const author = m.author ?? {};
      const authorId = String(author.id ?? "");
      const authorName = author.global_name || author.username || authorId || "Unknown";

      // avatar url (fallback to default embeds avatar)
      let authorAvatar = "";
      if (author.avatar) {
        authorAvatar = `https://cdn.discordapp.com/avatars/${authorId}/${author.avatar}.png?size=64`;
      } else {
        try {
          const idx = Number(BigInt(authorId || "0") % BigInt(6));
          authorAvatar = `https://cdn.discordapp.com/embed/avatars/${idx}.png`;
        } catch {
          authorAvatar = "https://cdn.discordapp.com/embed/avatars/0.png";
        }
      }

      // build mention map for replacements
      const mentionMap: Record<string, string> = {};
      (m.mentions || []).forEach((u: any) => {
        const name = u?.global_name || u?.username || u?.id;
        if (u?.id && name) mentionMap[String(u.id)] = String(name);
      });

      // replace <@123> or <@!123> with @DisplayName
      let text = String(m.content ?? "");
      text = text.replace(/<@!?(\d+)>/g, (_match: string, id: string) => {
        return mentionMap[id] ? `@${mentionMap[id]}` : _match;
      });

      return {
        id: String(m.id),
        authorId,
        authorName: String(authorName),
        authorAvatar,
        content: text,
        timestamp: String(m.timestamp ?? m.edited_timestamp ?? new Date().toISOString()),
      };
    });

    return NextResponse.json(data);
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}
