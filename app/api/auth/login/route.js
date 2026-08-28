import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getDb } from "../../../../lib/mongodb";
import { createSessionToken, SESSION_COOKIE, sessionCookieOptions } from "../../../../lib/auth";

export async function POST(request) {
  try {
    const body = await request.json();
    const email = String(body.email || "").trim().toLowerCase();
    const password = String(body.password || "");

    if (!email || !password) {
      return NextResponse.json({ success: false }, { status: 400 });
    }

    const db = await getDb();
    const admin = await db.collection("admins").findOne({ email });

    if (!admin) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const isBcryptHash = typeof admin.password === "string" && admin.password.startsWith("$2");
    let passwordMatches = false;

    if (isBcryptHash) {
      passwordMatches = await bcrypt.compare(password, admin.password);
    } else {
      // توافق مع الحسابات القديمة اللي كلمة سرها محفوظة نص عادي:
      // إذا طابقت، نرقّيها فوراً إلى هاش bcrypt عشان ما تبقى نص عادي بالداتابيز
      passwordMatches = password === admin.password;
      if (passwordMatches) {
        const hashed = await bcrypt.hash(password, 12);
        await db.collection("admins").updateOne(
          { _id: admin._id },
          { $set: { password: hashed } }
        );
      }
    }

    if (!passwordMatches) {
      return NextResponse.json({ success: false }, { status: 401 });
    }

    const token = await createSessionToken(email);
    const response = NextResponse.json({ success: true });
    response.cookies.set(SESSION_COOKIE, token, sessionCookieOptions);
    return response;
  } catch (e) {
    console.error("Login Error:", e.message);
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
