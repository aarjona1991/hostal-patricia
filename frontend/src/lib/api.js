export async function apiFetch(path, options = {}) {
  const { headers: optHeaders, ...fetchRest } = options;
  const res = await fetch(path, {
    credentials: "include",
    cache: options.cache ?? "default",
    headers: {
      "Content-Type": "application/json",
      ...(optHeaders || {}),
    },
    ...fetchRest,
  });

  if (!res.ok) {
    let body = null;
    try {
      body = await res.json();
    } catch {
      body = null;
    }
    const message = body?.error || `HTTP ${res.status}`;
    const err = new Error(message);
    err.status = res.status;
    err.body = body;
    throw err;
  }

  const ct = res.headers.get("content-type") || "";
  if (ct.includes("application/json")) return res.json();
  return res.text();
}

/** Subida de imagen (multipart). No usar apiFetch: no envía JSON. */
export async function uploadImageFile(file) {
  const fd = new FormData();
  fd.append("file", file);
  const res = await fetch("/api/upload", {
    method: "POST",
    credentials: "include",
    body: fd,
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = body.message || body.error || `HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    err.body = body;
    throw err;
  }
  return body;
}

