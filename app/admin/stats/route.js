import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";
import { requireAdmin } from "@/lib/auth";

export async function GET(request) {
  if (!(await requireAdmin(request))) {
    return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  }
  try {
    const db = await getDb();

    // 1. حساب عدد المنتجات
    const totalProducts = await db.collection("products").countDocuments();

    // 2. جلب كل الطلبات لحساب الإحصائيات
    const orders = await db.collection("orders").find({}).toArray();

    const totalOrders = orders.length;
    const newOrders = orders.filter(o => o.status === "جديد").length;
    
    // 3. حساب إجمالي المبيعات (فقط للطلبات التي تم توصيلها أو المدفوعة)
    const totalSales = orders
      .filter(o => o.status === "تم التوصيل")
      .reduce((sum, order) => sum + parseFloat(order.totalPrice || 0), 0);

    return NextResponse.json({
      totalSales: totalSales.toFixed(3),
      totalOrders,
      newOrders,
      totalProducts,
      recentOrders: orders.slice(-5).reverse() // آخر 5 طلبات
    });
  } catch (e) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}