import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import nodemailer from "nodemailer";
import { requireAdmin } from "../../../lib/auth";
import { computeTotals, isValidJordanPhone, escapeHtml } from "../../../lib/pricing";

// 1. GET: Fetch orders for the admin dashboard
export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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

// 2. POST: Handle new order submission
export async function POST(request) {
  try {
    const body = await request.json();
    const name = String(body.name || "").trim();
    const street = String(body.street || "").trim();
    const phone = String(body.phone || "").trim();
    const zone = String(body.zone || "").trim();
    const cart = Array.isArray(body.cart) ? body.cart : [];

    if (!name || !street || !phone || !zone) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!isValidJordanPhone(phone)) {
      return NextResponse.json({ error: "Invalid phone number" }, { status: 400 });
    }
    if (cart.length === 0) {
      return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
    }

    const db = await getDb();

    const zoneDoc = await db.collection("deliveryZones").findOne({ name: zone });
    if (!zoneDoc) {
      return NextResponse.json({ error: "Invalid delivery zone" }, { status: 400 });
    }

    const verifiedCart = [];
    const priceItems = [];
    for (const line of cart) {
      const productId = line?.product?._id || line?.product?.id;
      if (!productId || !ObjectId.isValid(productId)) {
        return NextResponse.json({ error: "Invalid product" }, { status: 400 });
      }
      const productDoc = await db.collection("products").findOne({ _id: new ObjectId(productId) });
      if (!productDoc || !productDoc.inStock) {
        return NextResponse.json(
          { error: `Product "${line?.product?.name || ""}" is currently out of stock` },
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

    // Save order to database first
    const result = await db.collection("orders").insertOne({
      name,
      street,
      phone,
      zone,
      cart: verifiedCart,
      ...totals,
      status: "New",
      createdAt: new Date(),
    });

    // Independent email dispatch block (won't block order placement if it fails)
    if (process.env.ADMIN_EMAIL && process.env.GMAIL_APP_PASSWORD) {
      try {
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
              <div style="font-size: 12px; color: #d4af37;">🌸 ${escapeHtml(item.selectedScent || 'Default')}</div>
            </td>
            <td style="padding: 15px; text-align: center; color: #f5d98a;">${item.qty}</td>
            <td style="padding: 15px; text-align: left; color: #f0c060; font-weight: bold;">${(item.product.price * item.qty).toFixed(3)} JOD</td>
          </tr>
        `).join('');

        await transporter.sendMail({
          from: `"Haya Store 🕯️" <${process.env.ADMIN_EMAIL}>`,
          to: process.env.ADMIN_EMAIL,
          subject: `New Order! - ${escapeHtml(name)}`,
          html: `
            <div dir="ltr" style="background-color: #0f0a05; padding: 20px; font-family: 'Arial', sans-serif; color: #f5d98a;">
              <div style="max-width: 600px; margin: 0 auto; background: #1a1208; border-radius: 20px; overflow: hidden; border: 1px solid #d4af37;">
                <div style="background: linear-gradient(180deg, #c8861e 0%, #a06818 100%); padding: 30px; text-align: center;">
                  <h1 style="margin: 0; color: #fff; font-size: 24px;">New Order Received!</h1>
                </div>
                <div style="padding: 20px;">
                  <p><b>Name:</b> ${escapeHtml(name)}</p>
                  <p><b>Zone:</b> ${escapeHtml(zone)}</p>
                  <p><b>Phone:</b> ${escapeHtml(phone)}</p>
                </div>
                <div style="padding: 0 20px 20px 20px;">
                  <table style="width: 100%; border-collapse: collapse; background: rgba(255,255,255,0.03); border-radius: 12px;">
                    <tbody>${itemsHtml}</tbody>
                  </table>
                </div>
                <div style="padding: 20px; background: rgba(200,134,30,0.1); text-align: center; border-top: 1px solid #d4af37;">
                  <div style="font-size: 24px; color: #f5d98a; font-weight: bold;">${totals.grandTotal.toFixed(3)} JOD</div>
                </div>
              </div>
            </div>
          `,
        });
      } catch (mailErr) {
        console.error("Mail Error (Non-blocking):", mailErr);
      }
    }

    return NextResponse.json({ success: true, id: result.insertedId }, { status: 200 });

  } catch (e) {
    console.error("POST Error:", e);
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 3. PATCH: Update order status (Admin only)
export async function PATCH(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { id, status } = await request.json();
    if (!id || !status || !ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Missing data" }, { status: 400 });
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