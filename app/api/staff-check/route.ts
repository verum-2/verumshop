import { NextResponse } from "next/server";

/**
 * GET /api/staff-check?id=<discord_user_id>
 * Env required:
 *  - DISCORD_BOT_TOKEN
 *  - DISCORD_GUILD_ID
 *  - ROLE_ID_SELLER    (the Seller role ID in your guild)
 */
export async function GET(req: Request) {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guild = process.env.DISCORD_GUILD_ID;
  const sellerRole = process.env.ROLE_ID_SELLER;

  if (!token || !guild || !sellerRole) {
    return NextResponse.json(
      { ok: false, isSeller: false, message: "Server missing env: DISCORD_BOT_TOKEN, DISCORD_GUILD_ID, ROLE_ID_SELLER" },
      { status: 500 }
    );
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ ok: false, isSeller: false, message: "Missing ?id=" }, { status: 400 });
  }

  try {
    // Fetch member from guild (needs Server Members Intent)
    const r = await fetch(
      `https://discord.com/api/v10/guilds/${guild}/members/${id}`,
      { headers: { Authorization: `Bot ${token}` }, cache: "no-store" }
    );

    if (r.status === 404) {
      return NextResponse.json({ ok: true, isSeller: false, name: null, avatar: null, status: null });
    }
    if (!r.ok) {
      const txt = await r.text();
      return NextResponse.json({ ok: false, isSeller: false, message: `Discord ${r.status}: ${txt}` }, { status: 502 });
    }

    const m = await r.json();
    const roles: string[] = m.roles || [];
    const isSeller = roles.includes(sellerRole);

    const user = m.user || {};
    const name = user.global_name || user.username || user.id || "Unknown";
    const avatar = user.avatar
      ? `https://cdn.discordapp.com/avatars/${user.id}/${user.avatar}.png?size=64`
      : undefined;

    // Presence is only available via Gateway; REST won’t return it.
    const status = null as string | null;

    return NextResponse.json({ ok: true, isSeller, role: isSeller ? "Seller" : null, name, avatar, status });
  } catch (e: any) {
    return NextResponse.json({ ok: false, isSeller: false, message: e?.message ?? "unknown error" }, { status: 500 });
  }
}
