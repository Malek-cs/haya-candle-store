import { NextResponse } from "next/server";
import { getDb } from "@/lib/mongodb";

export async function GET() {
  try {
    const db = await getDb();

    const zones = await db.collection("deliveryZones").find({}).toArray();
    
    return NextResponse.json(zones);
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: "Failed to fetch zones" }, { status: 500 });
  }
}