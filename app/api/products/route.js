import { NextResponse } from "next/server";
import { getDb } from "../../../lib/mongodb";
import { ObjectId } from "mongodb";
import { requireAdmin } from "../../../lib/auth";

// 1. جلب المنتجات (GET) - عام، تحتاجه صفحة المتجر
export async function GET() {
  try {
    const db = await getDb();
    const products = await db.collection("products")
      .find({})
      .sort({ inStock: -1, createdAt: -1 })
      .toArray();
    return NextResponse.json(products);
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 2. إضافة منتج جديد (POST) - أدمن فقط
export async function POST(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const body = await request.json();
    const db = await getDb();

    // ✅ يقبل scents أو flavors
    const scents = Array.isArray(body.scents)  ? body.scents
                 : Array.isArray(body.flavors) ? body.flavors
                 : typeof body.flavors === 'string' && body.flavors
                   ? body.flavors.split(',').map(f => f.trim())
                   : [];

    const newProduct = {
      name: body.name,
      price: parseFloat(body.price),
      image: body.image.startsWith('/') ? body.image : `/products/${body.image}`,
      desc: body.desc || "",
      category: body.category || "فردي",
      inStock: body.inStock !== undefined ? body.inStock : true,
      scents,
      scentsCount: body.scentsCount ? parseInt(body.scentsCount) : 1, // ✅ حفظ عدد النكهات
      createdAt: new Date(),
    };

    const result = await db.collection("products").insertOne(newProduct);
    return NextResponse.json({ success: true, id: result.insertedId });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 3. حذف منتج (DELETE) - أدمن فقط
export async function DELETE(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

    const db = await getDb();

    await db.collection("products").deleteOne({ _id: new ObjectId(id) });
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}

// 4. تعديل منتج (PUT) - أدمن فقط
export async function PUT(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");
    if (!id) return NextResponse.json({ error: "ID مطلوب" }, { status: 400 });

    const body = await request.json();
    const db = await getDb();

    const scents = Array.isArray(body.flavors) ? body.flavors
                 : Array.isArray(body.scents)  ? body.scents : [];

    await db.collection("products").updateOne(
      { _id: new ObjectId(id) },
      { $set: {
        name: body.name,
        price: parseFloat(body.price),
        image: body.image.startsWith('/') ? body.image : `/products/${body.image}`,
        desc: body.desc || "",
        category: body.category,
        inStock: body.inStock,
        scents,
        scentsCount: body.scentsCount ? parseInt(body.scentsCount) : 1,
      }}
    );
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}