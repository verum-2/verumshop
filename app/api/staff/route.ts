import { NextResponse } from "next/server";

type BucketKey = "owner" | "coOwner" | "pengu" | "seller";
type Person = { id: string; name: string; avatar?: string };

const avatarUrl = (id: string, avatar: string | null | undefined) =>
  avatar ? `https://cdn.discordapp.com/avatars/${id}/${avatar}.png?size=64` : undefined;

const displayName = (m: any) =>
  m?.nick || m?.user?.global_name || m?.user?.username || m?.user?.id || "Unknown";

const makeBuckets = () => ({
  owner: [] as Person[],
  coOwner: [] as Person[],
  pengu: [] as Person[],
  seller: [] as Person[],
});

const prioritize = (b: Record<BucketKey, Person[]>) => {
  const seen = new Set<string>();
  (["owner", "coOwner", "pengu", "seller"] as BucketKey[]).forEach((k) => {
    b[k] = b[k].filter((m) => !seen.has(m.id) && (seen.add(m.id), true));
  });
  return b;
};

export async function GET() {
  const token = process.env.DISCORD_BOT_TOKEN;
  const guild = process.env.DISCORD_GUILD_ID;
  const roleId = {
    owner: process.env.ROLE_ID_OWNER,
    coOwner: process.env.ROLE_ID_COOWNER,
    pengu: process.env.ROLE_ID_PENGU,
    seller: process.env.ROLE_ID_SELLER,
  };

  if (!token || !guild || !roleId.owner || !roleId.coOwner || !roleId.pengu || !roleId.seller) {
    return NextResponse.json(makeBuckets());
  }

  try {
    const res = await fetch(`https://discord.com/api/v10/guilds/${guild}/members?limit=1000`, {
      headers: { Authorization: `Bot ${token}` },
      cache: "no-store",
    });
    if (!res.ok) {
      return NextResponse.json({ error: `Discord ${res.status}` }, { status: 502 });
    }

    const members = (await res.json()) as any[];
    const buckets = makeBuckets();

    for (const m of members) {
      const roles: string[] = m.roles || [];
      const person: Person = {
        id: m.user.id,
        name: displayName(m),
        avatar: avatarUrl(m.user.id, m.user.avatar),
      };
      const add = (k: BucketKey) => buckets[k].push(person);
      if (roles.includes(roleId.owner!)) add("owner");
      if (roles.includes(roleId.coOwner!)) add("coOwner");
      if (roles.includes(roleId.pengu!)) add("pengu");
      if (roles.includes(roleId.seller!)) add("seller");
    }

    (Object.keys(buckets) as BucketKey[]).forEach((k) => {
      buckets[k] = Array.from(new Map(buckets[k].map((x) => [x.id, x])).values()).sort((a, b) =>
        a.name.localeCompare(b.name),
      );
    });

    return NextResponse.json(prioritize(buckets));
  } catch (e: any) {
    return NextResponse.json({ error: e?.message ?? "unknown error" }, { status: 500 });
  }
}
