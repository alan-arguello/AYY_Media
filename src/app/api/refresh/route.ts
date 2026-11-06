import { revalidatePath } from "next/cache";

// Vercel calls this once a day (vercel.json), so the view counts stay fresh
// even on days nobody visits. It only marks the home page to be rebuilt.
export function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (secret && request.headers.get("authorization") !== `Bearer ${secret}`) {
    return new Response("Unauthorized", { status: 401 });
  }
  revalidatePath("/");
  return Response.json({ revalidated: true });
}
