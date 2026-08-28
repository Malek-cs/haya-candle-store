// جلسة الأدمن: توكن موقّع (HMAC) نحطه بكوكي httpOnly، مش localStorage
// بنستخدم Web Crypto (subtle) عشان يشتغل بالـ middleware (Edge) وبالـ API routes مع بعض

export const SESSION_COOKIE = "haya_session";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // أسبوع

function getSecretKey() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error("ADMIN_SESSION_SECRET غير موجود في env");
  return crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

function toBase64Url(bytes) {
  return Buffer.from(bytes).toString("base64url");
}

export async function createSessionToken(email) {
  const payload = JSON.stringify({ email, exp: Date.now() + SESSION_MAX_AGE_SECONDS * 1000 });
  const payloadB64 = toBase64Url(new TextEncoder().encode(payload));
  const key = await getSecretKey();
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payloadB64));
  return `${payloadB64}.${toBase64Url(signature)}`;
}

export async function verifySessionToken(token) {
  if (!token || !token.includes(".")) return null;
  const [payloadB64, signatureB64] = token.split(".");
  try {
    const key = await getSecretKey();
    const signature = Buffer.from(signatureB64, "base64url");
    const valid = await crypto.subtle.verify(
      "HMAC",
      key,
      signature,
      new TextEncoder().encode(payloadB64)
    );
    if (!valid) return null;

    const payload = JSON.parse(Buffer.from(payloadB64, "base64url").toString());
    if (!payload.exp || payload.exp < Date.now()) return null;
    return payload;
  } catch {
    return null;
  }
}

// يتفحص كوكي الجلسة على أي Request (يشتغل بالـ API routes وبالـ middleware)
export async function requireAdmin(request) {
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const payload = await verifySessionToken(token);
  return Boolean(payload);
}

export const sessionCookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: "lax",
  path: "/",
  maxAge: SESSION_MAX_AGE_SECONDS,
};
