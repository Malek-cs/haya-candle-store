import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { requireAdmin } from "../../../lib/auth";
import { computeTotals, isValidJordanPhone, escapeHtml } from "../../../lib/pricing";

// 1. وظيفة GET: لجلب الطلبات وعرضها في لوحة التحكم (الأدمن فقط)
export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const db = await getDb();

    const orders = await db.collection("orders")
      .find({})
      .sort({ createdAt: -1 })
      .toArray();

    return NextResponse.json(orders, { status: 200 });
  } catch (e) {
    console.error("Database Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 2. وظيفة POST: لاستقبال طلب جديد وإرسال إيميل (عام - الزبون بدون تسجيل دخول)
export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const street = String(body.street || "").trim();
    const phone = String(body.phone || "").trim();
    const zone = String(body.zone || "").trim();
    const cart = Array.isArray(body.cart) ? body.cart : [];

    if (!name || !street || !phone || !zone) {
      return NextResponse.json({ error: "الحقول المطلوبة ناقصة" }, { status: 400 });
    }
    if (!isValidJordanPhone(phone)) {
      return NextResponse.json({ error: "رقم الجوال غير صحيح" }, { status: 400 });
    }
    if (cart.length === 0) {
      return NextResponse.json({ error: "السلة فارغة" }, { status: 400 });
    }

    const db = await getDb();

    const zoneDoc = await db.collection("deliveryZones").findOne({ name: zone });
    if (!zoneDoc) {
      return NextResponse.json({ error: "منطقة توصيل غير صالحة" }, { status: 400 });
    }

    // إعادة حساب الأسعار من قاعدة البيانات مباشرة (منع التلاعب بالأسعار من المتصفح)
    const verifiedCart = [];
    const priceItems = [];
    for (const line of cart) {
      const productId = line?.product?._id || line?.product?.id;
      if (!productId || !ObjectId.isValid(productId)) {
        return NextResponse.json({ error: "منتج غير صالح" }, { status: 400 });
      }
      const productDoc = await db.collection("products").findOne({ _id: new ObjectId(productId) });
      if (!productDoc || !productDoc.inStock) {
        return NextResponse.json(
          { error: `المنتج "${line?.product?.name || ""}" غير متوفر حالياً` },
          { status: 400 }
        );
      }
      const qty = Math.max(1, Math.floor(Number(line.qty) || 1));
      priceItems.push({ price: productDoc.price, qty });
      verifiedCart.push({
        product: { _id: productDoc._id.toString(), name: productDoc.name, price: productDoc.price },
        qty,
        selectedScent: line.selectedScent || "",
      });
    }

    const totals = computeTotals({ items: priceItems, deliveryFee: zoneDoc.fee });

    const result = await db.collection("orders").insertOne({
      name,
      street,
      phone,
      zone,
      cart: verifiedCart,
      ...totals,
      status: "جديد",
      createdAt: new Date(),
    });

    // إعداد النودميلر
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.ADMIN_EMAIL,
        pass: process.env.GMAIL_APP_PASSWORD,
      },
    });

    const itemsHtml = verifiedCart.map(item => `
      <tr style="border-bottom: 1px solid rgba(212,175,55,0.1);">
        <td style="padding: 15px; color: #f5d98a;">
          <div style="font-weight: bold;">${escapeHtml(item.product.name)}</div>
          <div style="font-size: 12px; color: #d4af37;">🌸 ${escapeHtml(item.selectedScent || 'افتراضي')}</div>
        </td>
        <td style="padding: 15px; text-align: center; color: #f5d98a;">${item.qty}</td>
        <td style="padding: 15px; text-align: left; color: #f0c060; font-weight: bold;">${(item.product.price * item.qty).toFixed(3)} د.أ</td>
      </tr>
    `).join('');

    const mailOptions = {
      from: `"Haya Store 🕯️" <${process.env.ADMIN_EMAIL}>`,
      to: process.env.ADMIN_EMAIL,
      subject: `طلب جديد! - ${escapeHtml(name)}`,
      html: `
        <div dir="rtl" style="background-color: #0f0a05; padding: 20px; font-family: 'Arial', sans-serif; color: #f5d98a;">
          <div style="max-width: 600px; margin: 0 auto; background: #1a1208; border-radius: 20px; overflow: hidden; border: 1px solid #d4af37;">
            <div style="background: linear-gradient(180deg, #c8861e 0%, #a06818 100%); padding: 30px; text-align: center;">
              <div style="font-size: 40px; margin-bottom: 10px;">🕯️</div>
              <h1 style="margin: 0; color: #fff; font-size: 24px;">طلب جديد!</h1>
            </div>
            <div style="padding: 20px;">
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px; color: rgba(245,217,138,0.6);">👤 الاسم</td><td style="text-align: left; font-weight: bold;">${escapeHtml(name)}</td></tr>
                <tr><td style="padding: 8px; color: rgba(245,217,138,0.6);">📍 المنطقة</td><td style="text-align: left; font-weight: bold;">${escapeHtml(zone)}</td></tr>
                <tr><td style="padding: 8px; color: rgba(245,217,138,0.6);">📞 الجوال</td><td style="text-align: left; font-weight: bold;">${escapeHtml(phone)}</td></tr>
              </table>
            </div>
            <div style="padding: 0 20px 20px 20px;">
              <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 12px;">
                <thead><tr style="color: rgba(245,217,138,0.4); font-size: 12px;"><th style="padding: 10px; text-align: right;">المنتج</th><th style="padding: 10px;">الكمية</th><th style="padding: 10px; text-align: left;">السعر</th></tr></thead>
                <tbody>${itemsHtml}</tbody>
              </table>
            </div>
            <div style="padding: 20px; background: rgba(200,134,30,0.1); text-align: center; border-top: 1px solid #d4af37;">
              <div style="font-size: 24px; color: #f5d98a; font-weight: bold;">${totals.grandTotal.toFixed(3)} د.أ</div>
            </div>
          </div>
        </div>
      `,
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (mailErr) {
      // الطلب انحفظ بالداتابيز فعلياً، فشل الإيميل ما لازم يفشل الطلب كامل
      console.error("Mail Error:", mailErr);
    }

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 200 });

  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 3. وظيفة PATCH: تحديث حالة الطلب (أدمن فقط)
export async function PATCH(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { id, status } = await request.json();
    if (!id || !status || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "بيانات ناقصة" }, { status: 400 });
    }

    const db = await getDb();
    await db.collection("orders").updateOne(
      { _id: new ObjectId(id) },
      { $set: { status } }
    );

    return NextResponse.json({ success: true });
  } catch (e) {
    console.error("PATCH Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
