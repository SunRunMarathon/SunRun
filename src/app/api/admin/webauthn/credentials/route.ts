import { deleteCredential, listCredentials } from "@/lib/admin-credentials-db";
import { isAuthorizedRequest } from "@/lib/admin-session";

export async function GET(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  const credentials = await listCredentials();
  return Response.json({
    credentials: credentials.map((c) => ({
      id: c.id,
      deviceName: c.device_name,
      deviceType: c.device_type,
      createdAt: c.created_at,
      lastUsedAt: c.last_used_at,
    })),
  });
}

export async function DELETE(request: Request) {
  if (!isAuthorizedRequest(request)) {
    return Response.json({ error: "Brak autoryzacji" }, { status: 401 });
  }
  let body: { id?: string };
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Nieprawidłowe dane" }, { status: 400 });
  }
  if (!body.id) {
    return Response.json({ error: "Brak id" }, { status: 400 });
  }
  await deleteCredential(body.id);
  return Response.json({ ok: true });
}
