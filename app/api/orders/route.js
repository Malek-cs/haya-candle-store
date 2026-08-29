import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdmin } from "../../../lib/auth";
import { computeTotals, isValidJordanPhone } from "../../../lib/pricing";

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

// 2. POST: Handle new order submission (Lightning Fast)
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

    // Save order instantly
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