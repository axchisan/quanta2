export async function postJson<T>(url: string, body: unknown, bearerToken?: string): Promise<T> {
  const headers: Record<string, string> = { 'content-type': 'application/json' };
  if (bearerToken) headers.authorization = `Bearer ${bearerToken}`;
  const res = await fetch(url, {
    method: 'POST',
    headers,
    body: JSON.stringify(body),
  });
  const data: unknown = await res.json().catch(() => null);
  if (!res.ok) {
    const msg = (data as { error?: { message?: string } } | null)?.error?.message;
    throw new Error(msg ?? 'Ocurrió un error inesperado');
  }
  return data as T;
}
