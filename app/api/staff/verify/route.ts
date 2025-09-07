import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const url = new URL(req.url);
  const userId = url.searchParams.get("userId")?.trim();

  const token = process.env.DISCORD_BOT_TOKEN;
  const guild = process.env.DISCORD_GUILD_ID;
  const roleId = {
    owner: process.env.ROLE_ID_OWNER!,
    coOwner: process.env.ROLE_ID_COOWNER!,
    pengu: process.env.ROLE_ID_PENGU!,
    seller: process.env.ROLE_ID_SELLER!,
  };

  if (!userId) return NextResponse.json({ ok: false, error: "Missing userId" }, { status: 400 });
  if (!token || !guild || !roleId.owner || !roleId.coOwner || !roleId.pengu || !roleId.seller) {
    return NextResponse.json({ ok: false, error: "Server not configured" }, { status: 500 });
  }

  try {
    const r = await fetch(
      `https://discord.com/api/v10/guilds/${guild}/members/${userId}`,
      { headers: { Authorization: `Bot ${token}` }, cache: "no-store" }
    );

    if (r.status === 404) {
      return NextResponse.json({ ok: true, isStaff: false });
    }
    if (!r.ok) {
      const t = await r.text();
      return NextResponse.json({ ok: false, error: `Discord ${r.status}: ${t}` }, { status: 502 });
    }

    const m = await r.json();
    const roles: string[] = m.roles ?? [];
    let role: "Owner" | "Co-Owner" | "Pengu" | "Seller" | null = null;

    if (roles.includes(roleId.owner))   role = "Owner";
    else if (roles.includes(roleId.coOwner)) role = "Co-Owner";
    else if (roles.includes(roleId.pengu))   role = "Pengu";
    else if (roles.includes(roleId.seller))  role = "Seller";

    return NextResponse.json({ ok: true, isStaff: !!role, role });
  } catch (e: any) {
    return NextResponse.json({ ok: false, error: e?.message ?? "unknown error" }, { status: 500 });
  }
}
